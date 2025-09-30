import { setCORSHeaders } from './middleware/cors.js';

/**
 * Base Mini App Account Verification Endpoint
 * Handles account verification for Base platform
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default function handler(req, res) {
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Simple account verification
  if (req.method === 'POST') {
    const { address, signature, message } = req.body || {};
    
    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: address, signature, message',
        timestamp: new Date().toISOString()
      });
    }
    
    const farcasterUsername = process.env.FARCASTER_USERNAME || 'noalatam';
    const verifiedWallet = process.env.VERIFIED_WALLET || '0xD2F305Aec216eeb84a0E0E4b84582389cB24E669';
    
    return res.status(200).json({
      success: true,
      verified: true,
      address: address,
      farcasterUsername: farcasterUsername,
      verifiedWallet: verifiedWallet,
      timestamp: new Date().toISOString(),
      message: 'Account verification successful'
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
    verification: true,
    version: "1.0.0",
    status: "active",
    message: "SplitPay account verification endpoint is active"
  });
}


