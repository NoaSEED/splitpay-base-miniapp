# Manifests Strategy

## Archivo Principal
- `public/manifest.json` - Manifest único que cumple con:
  - PWA Web App Manifest standard
  - Base Mini Apps requirements
  - Farcaster Frame metadata

## Archivos de Respaldo
- `public/*.json.backup` - Versiones antiguas (mantener por si acaso)

## Uso
El archivo `manifest.json` es servido automáticamente por:
- `/manifest.json` (navegadores)
- `/api/manifest` (Base Mini Apps)
- Referenciado en `index.html` línea 13

## Actualización
Para actualizar información de la app, editar SOLO `public/manifest.json`



