// Base Mini App Webhook Endpoint
// This endpoint handles webhooks from Base

export default function handler(req, res) {
  // Set CORS headers for Base
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log webhook data for debugging
  console.log('Base webhook received:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  
  // Simple webhook handler
  if (req.method === 'POST') {
    const { type, data } = req.body || {};
    
    switch (type) {
      case 'user_action':
        // Handle user actions from Base
        console.log('User action:', data);
        break;
      case 'app_event':
        // Handle app events
        console.log('App event:', data);
        break;
      default:
        console.log('Unknown webhook type:', type);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Webhook received',
      timestamp: new Date().toISOString()
    });
  }
  
  // GET request - return webhook info
  res.status(200).json({
    webhook: true,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    status: "active",
    message: "SplitPay webhook endpoint is active"
  });
}
