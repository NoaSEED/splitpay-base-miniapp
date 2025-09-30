import { setCORSHeaders } from './middleware/cors.js';

/**
 * Base Mini App Ready Endpoint
 * Handles readiness verification from Base platform
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default function handler(req, res) {
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const startTime = Date.now();
  
  res.status(200).json({
    ready: true,
    version: "1.0.0",
    uptime: Date.now() - startTime,
    status: "ready",
    message: "SplitPay Mini App is ready"
  });
}


