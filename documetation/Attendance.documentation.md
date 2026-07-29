# Attendance Module Documentation

Comprehensive documentation for the Attendance Module, including API endpoints, geo-fencing location validation, status determination rules, and automated background jobs.

---

## 📌 Overview

The **Attendance Module** manages employee daily clock-in and clock-out activities. It enforces geo-fencing validation against assigned office coordinates, records punch-in/punch-out office relations, calculates total working hours, dynamically assigns attendance statuses (`PRESENT`, `HALF_DAY`, `ABSENT`, `CLOCKED_IN`), and automates end-of-day absentee tracking for active employees.

---

## 📍 Geo-Fencing & Location Verification

The system validates employee location coordinates (`latitude` and `longitude`) against assigned office radiuses during both clock-in and clock-out operations.

### Verification Flow
1. **Coordinate Extraction:** Validates that `location.latitude` and `location.longitude` are provided and numeric.
2. **Office Assignment Lookup:** Identifies assigned offices from employee settings (`employee.punchIn` for clock-in, `employee.punchOut` for clock-out).
   - If specific offices are assigned (by ID or name), it matches against those.
   - **Fallback:** If no specific office is assigned, it checks against all active offices registered in the system.
3. **Distance Calculation:** Computes the distance between the employee's current coordinates and the office location using the **Haversine formula**.
4. **Radius Check:** Validates whether the employee's distance is within the office's allowed `radius` (in meters).
5. **Office Binding:** On validation success, links the matched office ID to `punchinOffice` (for clock-in) or `punchoutOffice` (for clock-out).
6. **Location Sync:** Updates the employee's `last_location` string and `last_Sync_mobile` timestamp.
7. **Geofence Enforcement:** If the employee is not within any allowed office radius, the request is rejected with a `400 Bad Request` error.

---

## ⏱️ Attendance Status Calculation Rules

When an employee completes a punch-out or an attendance record is updated, the system calculates `total_hours` (`(clock_out - clock_in) in hours`) and automatically assigns the attendance `status`:

| Working Hours (`total_hours`) | Assigned Status | Description |
| :--- | :--- | :--- |
| **`total_hours >= 4.5 hrs`** | `PRESENT` | Full day attendance |
| **`2.0 hrs <= total_hours < 4.5 hrs`** | `HALF_DAY` | Half day attendance |
| **`total_hours < 2.0 hrs`** | `ABSENT` | Insufficient working hours |
| **`No Clock-In Recorded`** | `ABSENT` | Auto-marked at end of day |
| **`Active Punch-In (No Clock-Out)`** | `CLOCKED_IN` | Ongoing active shift |

> [!NOTE]
> If a clock-out includes new remarks, they are appended to the initial clock-in remarks formatted as: `Clock-In Remarks | Clock-Out Remarks`.

---

## 🤖 Automated Absentee Background Job (Cron)

- **Utility Path:** `backend/src/modules/attendance/utils/attendance.cron.js`
- **Execution Schedule:** Automatically runs daily between **23:45** and **23:59 PM**.
- **Behavior:**
  1. Retrieves all active employees (`employeeSchema`).
  2. Checks for attendance records on the current date (`YYYY-MM-DD`).
  3. Bulk-creates attendance records with `status: "ABSENT"`, `total_hours: 0`, and `remarks: "Auto-marked ABSENT (No clock-in recorded)"` for active employees with no clock-in record for the day.

---

## 🚀 API Endpoints Reference

Base URL: `/api/v1/attendance`  
*All endpoints require authentication middleware (`authMiddleware`).*

---

### 1. Clock In
**`POST /api/v1/attendance/clock-in`**

Records shift clock-in for the authenticated employee after geofence verification.

#### Request Body
```json
{
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, New Delhi"
  },
  "ip_address": "192.168.1.10",
  "device_info": "Chrome on Windows 11",
  "remarks": "Morning shift start"
}
```

#### Response `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "id": 15,
    "employee_id": 3,
    "date": "2026-07-24",
    "clock_in": "2026-07-24T09:00:00.000Z",
    "clock_out": null,
    "status": "CLOCKED_IN",
    "total_hours": null,
    "clock_in_location": {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "Connaught Place, New Delhi"
    },
    "clock_in_ip": "192.168.1.10",
    "clock_in_device": "Chrome on Windows 11",
    "punchinOffice": 1,
    "remarks": "Morning shift start",
    "employee": {
      "id": 3,
      "emp_id": "EMP-003",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Engineering"
    },
    "punchInOffice": {
      "id": 1,
      "name": "Headquarters",
      "address": "Connaught Place, New Delhi",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "radius": 500
    },
    "punchOutOffice": null
  },
  "message": "Clocked in successfully"
}
```

---

### 2. Clock Out
**`POST /api/v1/attendance/clock-out`**

Records shift clock-out for the authenticated employee after geofence verification, automatically computing `total_hours` and `status`.

#### Request Body
```json
{
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, New Delhi"
  },
  "ip_address": "192.168.1.10",
  "device_info": "Chrome on Windows 11",
  "remarks": "Leaving for the day"
}
```

#### Response `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "id": 15,
    "employee_id": 3,
    "date": "2026-07-24",
    "clock_in": "2026-07-24T09:00:00.000Z",
    "clock_out": "2026-07-24T17:30:00.000Z",
    "status": "PRESENT",
    "total_hours": 8.5,
    "clock_out_location": {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "Connaught Place, New Delhi"
    },
    "clock_out_ip": "192.168.1.10",
    "clock_out_device": "Chrome on Windows 11",
    "punchinOffice": 1,
    "punchoutOffice": 1,
    "remarks": "Morning shift start | Leaving for the day",
    "employee": {
      "id": 3,
      "emp_id": "EMP-003",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Engineering"
    },
    "punchInOffice": {
      "id": 1,
      "name": "Headquarters",
      "address": "Connaught Place, New Delhi",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "radius": 500
    },
    "punchOutOffice": {
      "id": 1,
      "name": "Headquarters",
      "address": "Connaught Place, New Delhi",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "radius": 500
    }
  },
  "message": "Clocked out successfully"
}
```

---

### 3. Create Attendance (Manual/Admin)
**`POST /api/v1/attendance/create`**

Convenience wrapper endpoint around clock-in for administrative or manual attendance creation.

---

### 4. Get Today's Attendance Status
**`GET /api/v1/attendance/today`**  
**`GET /api/v1/attendance/today/:employeeId`**

Fetches attendance status for today for the authenticated user or specified `employeeId` (or via `employee_id` query param).

#### Response `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "employee_id": 3,
    "date": "2026-07-24",
    "isClockedIn": true,
    "isClockedOut": false,
    "attendance": { ... }
  },
  "message": "Today's attendance status retrieved successfully"
}
```

---

### 5. Attendance Summary
**`GET /api/v1/attendance/summary`**

Retrieves summary statistics for attendance records.

#### Query Parameters
- `employee_id` *(optional)*: Filter by specific employee ID.
- `startDate` *(optional)*: Filter records on or after `YYYY-MM-DD`.
- `endDate` *(optional)*: Filter records on or before `YYYY-MM-DD`.

#### Response `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "totalDaysRecorded": 45,
    "currentlyClockedIn": 12,
    "completedClockedOut": 33
  },
  "message": "Attendance summary retrieved successfully"
}
```

---

### 6. Get All Attendance Records (Paginated)
**`GET /api/v1/attendance/get-all`**

Retrieves a paginated list of attendance records with populated `employee`, `punchInOffice`, and `punchOutOffice` associations.

#### Query Parameters
- `page` *(optional, default: 1)*: Page number.
- `limit` *(optional, default: 10)*: Records per page.
- `employee_id` *(optional)*: Filter by employee ID.
- `status` *(optional)*: Filter by status (`PRESENT`, `HALF_DAY`, `ABSENT`, `CLOCKED_IN`).
- `startDate` *(optional)*: Date range start (`YYYY-MM-DD`).
- `endDate` *(optional)*: Date range end (`YYYY-MM-DD`).

#### Response `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "totalItems": 150,
    "totalPages": 15,
    "currentPage": 1,
    "attendances": [
      {
        "id": 15,
        "employee_id": 3,
        "date": "2026-07-24",
        "clock_in": "2026-07-24T09:00:00.000Z",
        "clock_out": "2026-07-24T17:30:00.000Z",
        "status": "PRESENT",
        "total_hours": 8.5,
        "employee": { ... },
        "punchInOffice": { ... },
        "punchOutOffice": { ... }
      }
    ]
  },
  "message": "Attendance records retrieved successfully"
}
```

---

### 7. Get Attendance by ID
**`GET /api/v1/attendance/get/:id`**

Fetches a single attendance record by primary key ID.

---

### 8. Update Attendance Record
**`PUT /api/v1/attendance/update/:id`**

Updates an attendance record. Automatically recalculates `total_hours` and `status` if both `clock_in` and `clock_out` are present.

#### Request Body (Partial or Complete)
```json
{
  "clock_out": "2026-07-24T18:00:00.000Z",
  "remarks": "Updated clock-out time per manager approval"
}
```

---

### 9. Delete Attendance Record
**`DELETE /api/v1/attendance/delete/:id`**

Deletes an attendance record by ID.

---

### 10. Trigger Daily Absentee Auto-Marking (On-Demand)
**`POST /api/v1/attendance/mark-absentees`**

Manually triggers the auto-absentee marking process for a specific date or today.

#### Request Body / Query (Optional)
```json
{
  "date": "2026-07-24"
}
```

#### Response `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "date": "2026-07-24",
    "markedCount": 4,
    "absentEmployeeIds": [7, 12, 19, 23],
    "message": "Successfully marked 4 employees as ABSENT for 2026-07-24"
  },
  "message": "Daily absentees marked successfully"
}
```
