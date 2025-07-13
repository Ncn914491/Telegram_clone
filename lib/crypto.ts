// Simple encryption utilities for demonstration
// In production, use more robust encryption libraries

export async function generateKeyPair() {
  // Generate a simple key pair for demonstration
  // In production, use proper cryptographic libraries like Web Crypto API
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  )

  const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey)
  const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: arrayBufferToBase64(privateKey),
  }
}

export async function encryptMessage(message: string, publicKeyBase64: string): Promise<string> {
  try {
    const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64)
    const publicKey = await crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"],
    )

    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const encrypted = await crypto.subtle.encrypt("RSA-OAEP", publicKey, data)

    return arrayBufferToBase64(encrypted)
  } catch (error) {
    console.error("Encryption failed:", error)
    return message // Fallback to unencrypted for demo
  }
}

export async function decryptMessage(encryptedMessage: string, privateKeyBase64: string): Promise<string> {
  try {
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64)
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["decrypt"],
    )

    const encryptedBuffer = base64ToArrayBuffer(encryptedMessage)
    const decrypted = await crypto.subtle.decrypt("RSA-OAEP", privateKey, encryptedBuffer)

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error("Decryption failed:", error)
    return encryptedMessage // Fallback for demo
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
