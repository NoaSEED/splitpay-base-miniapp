import { setCORSHeaders } from './middleware/cors.js';

/**
 * Base Mini App Webhook Handler
 * Handles incoming webhooks from Base platform
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default function handler(req, res) {
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    
    const { type, data } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({ error: 'Missing required fields: type, data' });
    }
    
    const validTypes = ['user_connected', 'user_disconnected', 'transaction_completed'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid webhook type' });
    }
    
    switch (type) {
      case 'user_connected':
      case 'user_disconnected':
      case 'transaction_completed':
        // Handle webhook events
        break;
    }
    
    return res.status(200).json({
      success: true,
      message: 'Webhook received',
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET', 'POST'],
      received: req.method
    });
  }
  
  res.status(200).json({
    webhook: true,
    version: "1.0.0",
    status: "active",
    message: "SplitPay webhook endpoint is active"
  });
}


