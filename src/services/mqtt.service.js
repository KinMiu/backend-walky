/**
 * MQTT Coordination Service
 * Manages MQTT topic formatting and coordination metadata for active rooms.
 */
class MqttService {
  constructor() {
    this.topicPrefix = process.env.MQTT_TOPIC_PREFIX || "smk2pkl/walkie/rooms";
  }

  /**
   * Generates the root topic for a specific room.
   * @param {string} roomId
   * @returns {string} e.g. "smk2pkl/walkie/rooms/{roomId}"
   */
  getChannelTopic(roomId) {
    if (!roomId) {
      throw new Error("roomId is required to generate MQTT channel topic");
    }
    return `${this.topicPrefix}/${roomId}`;
  }

  /**
   * Publishes message to an MQTT topic (stub/helper for backend events).
   * @param {string} topic
   * @param {Object} payload
   */
  async publish(topic, payload) {
    // Topic published directly or logged on backend
    return true;
  }

  /**
   * Retrieves MQTT broker connection configuration.
   */
  getConfig() {
    return {
      host: process.env.MQTT_HOST || "195.35.23.135",
      port: Number(process.env.MQTT_PORT) || 1883,
      username: process.env.MQTT_USERNAME || "/smk2pkl:smk2iot",
      topicPrefix: this.topicPrefix,
    };
  }
}

export const mqttService = new MqttService();
export default mqttService;
