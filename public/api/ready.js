// Base Mini App Ready Endpoint
// This endpoint is called by Base to verify the app is ready

export default function handler(req, res) {
  // Set CORS headers for Base
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return ready status
  res.status(200).json({
    ready: true,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    status: "ready",
    message: "SplitPay Mini App is ready"
  });
}


