import crypto from "crypto";

/**
 * Agora Voice Service
 * Handles RTC token generation and configuration for real-time voice channels.
 */
class AgoraService {
  constructor() {
    this.appId = process.env.AGORA_APP_ID || "mock-agora-app-id";
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE || "mock-agora-cert";
  }

  /**
   * Generates a voice token for a specific channel and user.
   * Currently provides a placeholder/mock token generator structured for easy upgrade to Agora RTC SDK.
   * 
   * @param {Object} params
   * @param {string} params.channelName - The room UUID or channel identifier
   * @param {string} params.uid - The user ID or numeric UID
   * @param {string} [params.role="publisher"] - "publisher" | "subscriber"
   * @param {number} [params.expireSeconds=3600] - Token expiration in seconds
   * @returns {string} Agora RTC Voice Token
   */
  generateVoiceToken({channelName, uid, role = "publisher", expireSeconds = 3600}) {
    if (!channelName) {
      throw new Error("channelName is required to generate Agora token");
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expireSeconds;

    // Placeholder HMAC token generation representing an Agora Voice RTC Token
    const payload = `${this.appId}:${channelName}:${uid || "0"}:${role}:${privilegeExpiredTs}`;
    const signature = crypto
      .createHmac("sha256", this.appCertificate)
      .update(payload)
      .digest("hex");

    return `agora_rtc_v1_${Buffer.from(payload).toString("base64")}.${signature}`;
  }

  /**
   * Retrieves current Agora credentials configuration (excluding certificate).
   */
  getConfig() {
    return {
      appId: this.appId,
    };
  }
}

export const agoraService = new AgoraService();
export default agoraService;
