import { sequelize } from '../src/core/config/db.js';

async function importEmployees() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    // 1. Clear old employee data
    console.log('Clearing old employee records...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await sequelize.query('TRUNCATE TABLE employees;');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Old employee records removed.');

    // 2. Data to insert
    const employeesData = [
      {
        id: 1,
        name: 'Super Admin',
        manager_id: 0,
        identity: 'SUPERADMIN',
        department: 'Management',
        email: 'superadmin@gmail.com',
        designations: 'Super Administrator',
        mobile: '1234567890',
        work_shift: 'Day',
        status: 'active',
        work_location: 'HQ',
        type: 1,
        emp_type: 'Full-time',
        business_unit: 'Core',
        license: 'None',
        cost_center: 'CC001',
        app_version: '1.0.0',
        desktop_version: '1.0.0',
        last_desktop_started_at: '2026-07-17 13:11:27',
        last_Sync_desktop_at: '2026-07-17 13:11:27',
        last_Sync_mobile: '2026-07-28 05:39:46',
        last_location: '{"latitude":28.518974183990455,"longitude":77.28315052265188}',
        location: 'Unknown',
        address: 'HQ Office Address',
        date_of_birth: '1990-01-01 00:00:00',
        date_of_joining: '2026-07-17 13:11:27',
        state_id: 1,
        region_id: 1,
        branch_id: 1,
        password: '$2b$10$q9om/26XH3ofXUWdfZlbYOSCGAq/JV7QR3mmvxEFsY7Z3hmBsNxMC',
        createdAt: '2026-07-17 13:11:27',
        updatedAt: '2026-07-28 10:09:26',
        image: 'default.png',
        team: 'Admin',
        gender: 'male',
        blood_group: 'O+',
        label_color: '#FF0000',
        slug: 'super-admin',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwianRpIjoiN2VkZGM2YzctMmE2Ny00MjM4LTk5ZjItOWUwZTg3NDJiNGRlIiwiaWF0IjoxNzg1MjMzMzY2LCJleHAiOjE3ODU4MzgxNjYsImF1ZCI6InNhdHlhLWNvbGxlY3Rpb24tY2xpZW50IiwiaXNzIjoic2F0eWEtY29sbGVjdGlvbi1hcGkifQ.CwC9q7cX9KuLVz01gs',
        createdBy: 0,
        updatedBy: 0,
        punchIn: null,
        punchOut: null,
        entryAlerts: null,
        exitAlerts: null,
        emp_id: 'EMP96332',
        country_code: '+91'
      },
      {
        id: 7,
        name: 'Ratan Verma',
        manager_id: null,
        identity: 'EMP1003',
        department: 'Engineering',
        email: 'ratan.vermas@example.com',
        designations: 'Software Engineer',
        mobile: '9876843231',
        work_shift: 'General Shift',
        status: 'active',
        work_location: 'Office',
        type: 3,
        emp_type: 'permanent',
        business_unit: 'Technology',
        license: 'EMP-LIC-1002',
        cost_center: 'CC-TECH-002',
        app_version: '1.0.0',
        desktop_version: '1.0.0',
        last_desktop_started_at: '2026-07-18 04:05:00',
        last_Sync_desktop_at: '2026-07-18 04:35:00',
        last_Sync_mobile: '2026-07-28 13:39:21',
        last_location: '{"latitude":28.5189533,"longitude":77.2833847}',
        location: 'Noida',
        address: 'Sector 62, Noida, Uttar Pradesh',
        date_of_birth: '1997-08-22 00:00:00',
        date_of_joining: '2025-05-15 00:00:00',
        state_id: 9,
        region_id: 1,
        branch_id: 1,
        password: '$2b$10$/8sbRswq6taqIgBLhuTZFOL0mV5Fti0usHJUQpVjKvS1MxnybWD36',
        createdAt: '2026-07-20 10:07:35',
        updatedAt: '2026-07-28 13:39:21',
        image: 'https://img.magnific.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80',
        team: null,
        gender: 'male',
        blood_group: null,
        label_color: null,
        slug: 'ratan-verma-1x28f',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywianRpIjoiN2I0ZDhlM2YtMmMzOS00MDM4LTg5Y2QtYjdhMTI5ZjA2MWYzIiwiaWF0IjoxNzg1MjM5NTg1LCJleHAiOjE3ODU4NDQzODUsImF1ZCI6InNhdHlhLWNvbGxlY3Rpb24tY2xpZW50IiwiaXNzIjoic2F0eWEtY29sbGVjdGlvbi1hcGkifQ.FxKIifsjFLo-azbcgK',
        createdBy: 1,
        updatedBy: 1,
        punchIn: JSON.stringify([1, 2, 3]),
        punchOut: JSON.stringify([1, 2, 3]),
        entryAlerts: null,
        exitAlerts: null,
        emp_id: 'EMP96361',
        country_code: '+91'
      },
      {
        id: 8,
        name: 'Ratane Verma',
        manager_id: null,
        identity: 'EMP1006',
        department: 'Engineering',
        email: 'ratan.vermaes81@example.com',
        designations: 'Software Engineer',
        mobile: '9876843201',
        work_shift: 'General Shift',
        status: 'active',
        work_location: 'Office',
        type: 3,
        emp_type: 'permanent',
        business_unit: 'Technology',
        license: 'EMP-LIC-1002',
        cost_center: 'CC-TECH-002',
        app_version: '1.0.0',
        desktop_version: '1.0.0',
        last_desktop_started_at: '2026-07-18 04:05:00',
        last_Sync_desktop_at: '2026-07-18 04:35:00',
        last_Sync_mobile: '2026-07-18 04:40:00',
        last_location: '28.5355,77.3910',
        location: 'Noida',
        address: 'Sector 62, Noida, Uttar Pradesh',
        date_of_birth: '1997-08-22 00:00:00',
        date_of_joining: '2025-05-15 00:00:00',
        state_id: 9,
        region_id: 1,
        branch_id: 1,
        password: '$2b$10$dzOrFXYCIRFX/iSLu3T4feg2EYPVymB1zWZcbcmTozsUh1CLJeLD.',
        createdAt: '2026-07-20 11:51:07',
        updatedAt: '2026-07-20 11:51:07',
        image: 'https://img.magnific.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80',
        team: null,
        gender: 'male',
        blood_group: null,
        label_color: null,
        slug: 'ratane-verma-vrhr5',
        refreshToken: null,
        createdBy: 1,
        updatedBy: 1,
        punchIn: JSON.stringify([1, 2]),
        punchOut: JSON.stringify([1, 2, 3]),
        entryAlerts: JSON.stringify([1, 2]),
        exitAlerts: JSON.stringify([1, 2]),
        emp_id: 'EMP96930',
        country_code: '+91'
      }
    ];

    for (const emp of employeesData) {
      await sequelize.query(`
        INSERT INTO employees (
          id, emp_id, name, manager_id, identity, image, department, team, gender, blood_group,
          label_color, email, designations, country_code, mobile, work_shift, status, work_location,
          emp_type, business_unit, license, cost_center, type, punchIn, punchOut, entryAlerts,
          exitAlerts, app_version, desktop_version, last_desktop_started_at, last_Sync_desktop_at,
          last_Sync_mobile, last_location, location, address, date_of_birth, date_of_joining,
          state_id, slug, region_id, branch_id, password, refreshToken, createdBy, updatedBy,
          createdAt, updatedAt
        ) VALUES (
          :id, :emp_id, :name, :manager_id, :identity, :image, :department, :team, :gender, :blood_group,
          :label_color, :email, :designations, :country_code, :mobile, :work_shift, :status, :work_location,
          :emp_type, :business_unit, :license, :cost_center, :type, :punchIn, :punchOut, :entryAlerts,
          :exitAlerts, :app_version, :desktop_version, :last_desktop_started_at, :last_Sync_desktop_at,
          :last_Sync_mobile, :last_location, :location, :address, :date_of_birth, :date_of_joining,
          :state_id, :slug, :region_id, :branch_id, :password, :refreshToken, :createdBy, :updatedBy,
          :createdAt, :updatedAt
        );
      `, { replacements: emp });
      console.log(`✅ Inserted employee: ${emp.name} (ID: ${emp.id})`);
    }

    const [rows] = await sequelize.query('SELECT id, emp_id, name, email, status FROM employees;');
    console.log('\nFinal Employees Table Contents:');
    console.table(rows);

  } catch (err) {
    console.error('❌ Import failed:', err);
  } finally {
    await sequelize.close();
  }
}

importEmployees();
