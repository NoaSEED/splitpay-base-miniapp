import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minikitConfig } from '../minikit.config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifest = {
  version: "1",
  name: minikitConfig.miniapp.name,
  iconUrl: minikitConfig.miniapp.iconUrl,
  splashImageUrl: minikitConfig.miniapp.splashImageUrl,
  splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
  homeUrl: minikitConfig.miniapp.homeUrl
};

const outputPath = path.join(__dirname, '../public/manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
console.log('✅ Manifest generado en public/manifest.json');