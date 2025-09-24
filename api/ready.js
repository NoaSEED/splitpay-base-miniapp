// Ready endpoint for Base Mini Apps
// This endpoint indicates that the app is ready for Base.dev

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Serve ready status
  if (req.method === 'GET') {
    const readyStatus = {
      ready: true,
      status: "ready",
      timestamp: new Date().toISOString(),
      appName: "SplitPay",
      version: "1.0.0",
      network: "Base",
      chainId: 8453,
      features: [
        "wallet-connection",
        "expense-splitting",
        "payment-tracking",
        "group-management"
      ],
      supportedWallets: [
        "MetaMask",
        "WalletConnect",
        "Coinbase Wallet"
      ]
    };

    res.status(200).json(readyStatus);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
