import { Kafka } from "kafkajs";

const kafka = new Kafka({ brokers: ["localhost:9092"] });
const consumer = kafka.consumer({ groupId: "registration-notifications" });

// Topics to monitor
const TOPICS = ["restaurant-registrations", "driver-registrations"];

export const startRegistrationConsumer = async () => {
  await consumer.connect();

  // Subscribe to all topics
  await Promise.all(
    TOPICS.map((topic) => consumer.subscribe({ topic, fromBeginning: true }))
  );

  console.log(`👂 Listening to topics: ${TOPICS.join(", ")}`);

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const event = JSON.parse(message.value.toString());

      // 👇 Identify event type and log accordingly
      switch (event.type) {
        case "NEW_RESTAURANT_REGISTERED":
          console.log(
            "🍔 New Restaurant:",
            event.name,
            `(ID: ${event.restaurantId})`
          );
          // await saveRestaurantNotification(event);
          break;

        case "DRIVER_REGISTERED":
          console.log(
            "🏍️ New Driver:",
            event.name,
            `(Vehicle: ${event.vehicleType})`
          );
          // await saveDriverNotification(event);
          break;

        default:
          console.warn("⚠️ Unknown event type:", event.type);
      }
    },
  });
};
