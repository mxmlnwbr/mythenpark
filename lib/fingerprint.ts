/**
 * Generate a simple browser fingerprint for vote tracking
 * Combines multiple browser characteristics to create a unique identifier
 */
export function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width + 'x' + screen.height,
    screen.colorDepth.toString(),
  ];
  
  // Create a simple hash from the components
  const fingerprint = components.join('|');
  return btoa(fingerprint); // Base64 encode for storage
}

/**
 * Get or create a persistent device ID
 * Uses localStorage to persist across sessions
 */
export function getDeviceId(): string {
  const STORAGE_KEY = 'mythenpark_device_id';
  
  // Try to get existing device ID
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    // Generate new fingerprint-based ID
    deviceId = generateFingerprint();
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
}
