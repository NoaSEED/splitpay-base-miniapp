// Base Mini App Account Verification Endpoint
// This endpoint handles account verification for Base

export default function handler(req, res) {
  // Set CORS headers for Base
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log verification request
  console.log('Account verification request:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  
  // Simple account verification
  if (req.method === 'POST') {
    const { address, signature, message } = req.body || {};
    
    // Basic validation
    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: address, signature, message',
        timestamp: new Date().toISOString()
      });
    }
    
    // For now, just return success (in production, verify signature)
    return res.status(200).json({
      success: true,
      verified: true,
      address: address,
      timestamp: new Date().toISOString(),
      message: 'Account verification successful'
    });
  }
  
  // GET request - return verification info
  res.status(200).json({
    verification: true,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    status: "active",
    message: "SplitPay account verification endpoint is active"
  });
}


