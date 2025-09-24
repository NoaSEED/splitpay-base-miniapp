// Base Mini App Manifest Endpoint
// This endpoint serves the manifest for Base Mini Apps

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

  // Serve the Base Mini App manifest
  if (req.method === 'GET') {
    const manifest = {
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
      ogImageUrl: "https://splitpay-base-miniapp.vercel.app/og-image.png"
    };

    res.status(200).json(manifest);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
