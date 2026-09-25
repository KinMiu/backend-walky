import pkg from "agora-token";
const {RtcTokenBuilder, RtcRole} = pkg;

/**
 * Agora Voice Service
 * Handles RTC token generation and configuration for real-time voice channels.
 */
class AgoraService {
  constructor() {
    this.appId = process.env.AGORA_APP_ID || "bcf4a4fdd70644df9334dda1ea182364";
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE || "3c99bc2359b842a2816e70f5bdb6d5ee";
  }

  /**
   * Generates an official Agora RTC voice token for a specific channel and user.
   * 
   * @param {Object} params
   * @param {string} params.channelName - The room UUID or channel identifier
   * @param {string|number} params.uid - The user ID or numeric UID
   * @param {string} [params.role="publisher"] - "publisher" | "subscriber"
   * @param {number} [params.expireSeconds=86400] - Token expiration in seconds (default 24h)
   * @returns {string} Official Agora RTC Voice Token
   */
  generateVoiceToken({channelName, uid, role = "publisher", expireSeconds = 86400}) {
    if (!channelName) {
      throw new Error("channelName is required to generate Agora token");
    }

    const agoraRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const userAccount = String(uid || "0");

    // Privilege expiry timestamp
    const privilegeExpireTime = Math.floor(Date.now() / 1000) + expireSeconds;

    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      this.appId,
      this.appCertificate,
      channelName,
      userAccount,
      agoraRole,
      privilegeExpireTime,
      privilegeExpireTime,
    );

    return token;
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
