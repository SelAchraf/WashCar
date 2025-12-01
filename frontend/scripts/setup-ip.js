#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Get the local IP address of the machine
 * Prioritizes Wi-Fi and Ethernet connections
 */
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  
  // Priority order: wlp (Wi-Fi on Linux), wlan, en (Ethernet), eth
  const priorities = ['wlp', 'wlan', 'en', 'eth'];
  
  for (const priority of priorities) {
    for (const name of Object.keys(interfaces)) {
      if (name.startsWith(priority)) {
        const addresses = interfaces[name];
        for (const addr of addresses) {
          // IPv4, not internal (loopback)
          if (addr.family === 'IPv4' && !addr.internal) {
            return addr.address;
          }
        }
      }
    }
  }
  
  // Fallback: get any non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    const addresses = interfaces[name];
    for (const addr of addresses) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  
  // Last resort
  return 'localhost';
}

const ipAddress = getLocalIpAddress();
console.log(`✓ Detected IP address: ${ipAddress}`);

// Create .env file with the IP address
const envPath = path.join(__dirname, '..', '.env');
const envContent = `EXPO_PUBLIC_BACKEND_IP=${ipAddress}\n`;

fs.writeFileSync(envPath, envContent);
console.log(`✓ Created .env file with IP address`);
