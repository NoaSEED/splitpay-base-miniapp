// Base Mini App Configuration for SplitPay
// This file configures the manifest and metadata for the Base Mini App

const ROOT_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

export const minikitConfig = {
  accountAssociation: { 
    // This will be filled in step 4 of the Base Mini App setup
    "header": "",
    "payload": "",
    "signature": ""
  },
  miniapp: {
    version: "1",
    name: "SplitPay", 
    subtitle: "Gastos Compartidos en Base", 
    description: "Divide gastos con amigos usando USDC en Base Network. Simple, rápido y seguro. Perfecto para viajes, cenas, eventos y más.",
    screenshotUrls: [
      `${ROOT_URL}/screenshot-portrait.png`,
      `${ROOT_URL}/screenshot-landscape.png`
    ],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0052FF", // Base blue color
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "finance",
    tags: ["finance", "payments", "base", "usdc", "split-bills", "expenses", "friends"],
    heroImageUrl: `${ROOT_URL}/hero.png`, 
    tagline: "Divide gastos con amigos en Base",
    ogTitle: "SplitPay - Gastos Compartidos en Base",
    ogDescription: "Divide gastos con amigos usando USDC en Base Network. Simple, rápido y seguro.",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;

// Export the configuration
export default minikitConfig;

