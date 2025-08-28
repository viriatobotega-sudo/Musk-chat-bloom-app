"use client"

// Simple encryption utility for message content
export class MessageEncryption {
  private static key = "chatbloom-secret-key" // In production, use proper key management

  static async encrypt(text: string): Promise<string> {
    try {
      // Simple base64 encoding for demo - use proper encryption in production
      return btoa(unescape(encodeURIComponent(text)))
    } catch (error) {
      console.error("Encryption error:", error)
      return text
    }
  }

  static async decrypt(encryptedText: string): Promise<string> {
    try {
      // Simple base64 decoding for demo - use proper decryption in production
      return decodeURIComponent(escape(atob(encryptedText)))
    } catch (error) {
      console.error("Decryption error:", error)
      return encryptedText
    }
  }

  static async encryptMessage(content: string): Promise<string> {
    return this.encrypt(content)
  }

  static async decryptMessage(encryptedContent: string): Promise<string> {
    return this.decrypt(encryptedContent)
  }
}
