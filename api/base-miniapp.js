// Base Mini App endpoint
// This endpoint provides Base Mini App specific information

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

  // Serve Base Mini App information
  if (req.method === 'GET') {
    const baseMiniAppInfo = {
      version: "1",
      name: "SplitPay",
      subtitle: "Gastos Compartidos en Base",
      description: "Divide gastos con amigos usando USDC en Base Network. Simple, rápido y seguro.",
      iconUrl: "https://splitpay-base-miniapp.vercel.app/icon.png",
      splashImageUrl: "https://splitpay-base-miniapp.vercel.app/splash.png",
      splashBackgroundColor: "#0052FF",
      homeUrl: "https://splitpay-base-miniapp.vercel.app/",
      webhookUrl: "https://splitpay-base-miniapp.vercel.app/api/webhook",
      primaryCategory: "finance",
      tags: ["finance", "payments", "base", "usdc", "split-bills"],
      heroImageUrl: "https://splitpay-base-miniapp.vercel.app/hero.png",
      tagline: "Divide gastos con amigos en Base",
      ogTitle: "SplitPay - Gastos Compartidos en Base",
      ogDescription: "Divide gastos con amigos usando USDC en Base Network.",
      ogImageUrl: "https://splitpay-base-miniapp.vercel.app/og-image.png",
      screenshotUrls: [
        "https://splitpay-base-miniapp.vercel.app/screenshot-portrait.png",
        "https://splitpay-base-miniapp.vercel.app/screenshot-landscape.png"
      ],
      ready: true,
      status: "active",
      network: "Base",
      chainId: 8453,
      currency: "USDC",
      features: [
        "wallet-connection",
        "expense-splitting", 
        "payment-tracking",
        "group-management",
        "debt-notifications"
      ],
      supportedWallets: [
        "MetaMask",
        "WalletConnect", 
        "Coinbase Wallet",
        "Rabby"
      ]
    };

    res.status(200).json(baseMiniAppInfo);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
