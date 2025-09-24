// Base Mini App Webhook Handler
// This endpoint handles webhooks from Base Mini Apps

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST requests (webhook events)
  if (req.method === 'POST') {
    try {
      const { type, data } = req.body;
      
      console.log('Base Mini App Webhook:', { type, data });
      
      // Handle different webhook events
      switch (type) {
        case 'user_connected':
          console.log('User connected to SplitPay:', data);
          break;
        case 'user_disconnected':
          console.log('User disconnected from SplitPay:', data);
          break;
        case 'transaction_completed':
          console.log('Transaction completed:', data);
          break;
        default:
          console.log('Unknown webhook type:', type);
      }
      
      res.status(200).json({ success: true, message: 'Webhook received' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
