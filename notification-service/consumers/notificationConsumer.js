import { Kafka } from "kafkajs";
import Notification from "../models/Notification.js";

const kafka = new Kafka({ brokers: ["localhost:9092"] });
const consumer = kafka.consumer({ groupId: "registration-notifications" });

// Topics to monitor
const TOPICS = ["restaurant-registrations", "driver-registrations"];

// Function to save restaurant registration notification
const saveRestaurantNotification = async (event) => {
  try {
    const notification = new Notification({
      type: "RESTAURANT_REGISTRATION",
      recipientType: "system",
      relatedEntity: {
        id: event.restaurantId,
        type: "restaurant",
      },
      title: "New Restaurant Registered",
      message: `Restaurant ${event.name} (ID: ${event.restaurantId}) has been registered.`,
      metadata: {
        restaurantName: event.name,
      },
      status: "unread",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    await notification.save();
    console.log(`✅ Saved restaurant notification for ${event.name}`);
  } catch (err) {
    console.error("❌ Failed to save restaurant notification:", err);
  }
};

// Function to save driver registration notification
const saveDriverNotification = async (event) => {
  try {
    const notification = new Notification({
      type: "DRIVER_REGISTRATION",
      recipientType: "system",
      relatedEntity: {
        id: event.driverId || event.id, // Adjust based on event structure
        type: "driver",
      },
      title: "New Driver Registered",
      message: `Driver ${event.name} (Vehicle: ${event.vehicleType}) has been registered.`,
      metadata: {
        driverName: event.name,
        vehicleType: event.vehicleType,
      },
      status: "unread",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    await notification.save();
    console.log(`✅ Saved driver notification for ${event.name}`);
  } catch (err) {
    console.error("❌ Failed to save driver notification:", err);
  }
};

export const startRegistrationConsumer = async () => {
  await consumer
    .connect()
    .then(() => console.log("✅ Connected to Kafka"))
    .catch((err) => console.error("❌ Kafka connection failed:", err));

  // Subscribe to all topics
  await Promise.all(
    TOPICS.map((topic) => consumer.subscribe({ topic, fromBeginning: true }))
  );

  console.log(`👂 Listening to topics: ${TOPICS.join(", ")}`);

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const event = JSON.parse(message.value.toString());

        // Identify event type and process accordingly
        switch (event.type) {
          case "NEW_RESTAURANT_REGISTERED":
            console.log(
              "🍔 New Restaurant:",
              event.name,
              `(ID: ${event.restaurantId})`
            );
            await saveRestaurantNotification(event);
            break;

          case "DRIVER_REGISTERED":
            console.log(
              "🏍️ New Driver:",
              event.name,
              `(Vehicle: ${event.vehicleType})`
            );
            await saveDriverNotification(event);
            break;

          default:
            console.warn("⚠️ Unknown event type:", event.type);
        }
      } catch (err) {
        console.error("❌ Error processing message:", err);
      }
    },
  });
};
