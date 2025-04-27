import { Kafka } from "kafkajs";

class KafkaProducer {
  constructor() {
    this.kafka = new Kafka({
      clientId: "food-delivery-app",
      brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
    });
    this.producer = this.kafka.producer();
  }

  async sendNotification(event) {
    try {
      await this.producer.connect();
      await this.producer.send({
        topic: event.topic || "notifications",
        messages: [
          {
            value: JSON.stringify(event),
          },
        ],
      });
    } catch (error) {
      console.error("Kafka Producer Error:", error);
      throw error;
    } finally {
      await this.producer.disconnect();
    }
  }
}

// Singleton instance
const kafkaProducer = new KafkaProducer();

// Named export
export const sendNotification =
  kafkaProducer.sendNotification.bind(kafkaProducer);

// Alternative: Export the class directly if needed
export { KafkaProducer };
