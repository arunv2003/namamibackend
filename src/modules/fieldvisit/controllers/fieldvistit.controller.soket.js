import { processSocketLocationUpdate } from "../services/fieldvisit.service.soket.js";

export const handleFieldVisitSockets = (io, socket) => {
  // Event: Admin / Monitor client joins field visits live room
  socket.on("join:fieldVisit", () => {
    socket.join("field_visits_room");
    console.log(`📡 [SOCKET] Client ${socket.id} joined field_visits_room`);
    socket.emit("fieldVisit:joined", { message: "Joined field visits monitoring room" });
  });

  // Event: Client leaves field visits live room
  socket.on("leave:fieldVisit", () => {
    socket.leave("field_visits_room");
    console.log(`📡 [SOCKET] Client ${socket.id} left field_visits_room`);
  });

  // Event: Mobile / Employee app sends location update
  socket.on("fieldVisit:addLocation", async (payload, ackCallback) => {
    console.log(payload,"payloadpayloadpayloadpayloadpayloadpayloadpayloadpayloadpayloadpayloadpayloadpayload")
    try {
      if (!payload || payload.latitude === undefined || payload.longitude === undefined) {
        const errorResponse = { success: false, message: "latitude and longitude are required" };
        if (typeof ackCallback === "function") ackCallback(errorResponse);
        socket.emit("fieldVisit:error", errorResponse);
        return;
      }

      const finalPayload = {
        ...payload,
        emp_id: payload?.emp_id || socket.emp_id || socket.user?.id,
      };

      if (!finalPayload.emp_id) {
        const errorResponse = { success: false, message: "emp_id is required (provide in payload or connect with Auth Token)" };
        if (typeof ackCallback === "function") ackCallback(errorResponse);
        socket.emit("fieldVisit:error", errorResponse);
        return;
      }

      const result = await processSocketLocationUpdate(finalPayload);

      const response = {
        success: true,
        message: result.isNew ? "New field visit created via Socket" : "Location added via Socket",
        data: result.visit,
        addedLocation: result.addedLocation,
      };

      // Send ack to sender
      if (typeof ackCallback === "function") {
        ackCallback(response);
      }
      socket.emit("fieldVisit:locationAck", response);

      // Broadcast live update to all listeners in field_visits_room
      io.to("field_visits_room").emit("fieldVisit:liveUpdate", response);

    } catch (error) {
      console.error(`❌ [SOCKET ERROR] fieldVisit:addLocation failed: ${error.message}`);
      const errorPayload = { success: false, message: error.message };
      if (typeof ackCallback === "function") ackCallback(errorPayload);
      socket.emit("fieldVisit:error", errorPayload);
    }
  });
};

export default handleFieldVisitSockets;
