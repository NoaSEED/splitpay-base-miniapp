// Account Verification Endpoint for Farcaster
// This endpoint handles account verification for Base Mini Apps

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

  // Serve account verification info
  if (req.method === 'GET') {
    const verificationInfo = {
      farcasterUsername: "noalatam",
      walletAddress: "0xD2F305Aec216eeb84a0E0E4b84582389cB24E669",
      verified: true,
      verificationDate: new Date().toISOString(),
      appName: "SplitPay",
      appUrl: "https://splitpay-base-miniapp.vercel.app/",
      network: "Base",
      chainId: 8453
    };

    res.status(200).json(verificationInfo);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
