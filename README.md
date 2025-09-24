# 🚀 SplitPay - Base Mini App

> **Gastos Compartidos en Base Network**

SplitPay es una Mini App para Base que permite dividir gastos con amigos usando USDC. Simple, rápido y seguro.

## ✨ **Características**

- 🔗 **Web3 Nativo**: Integración completa con Base Network
- 💱 **USDC en Base**: Transacciones rápidas y económicas
- 👥 **Gastos Compartidos**: Divide gastos entre amigos
- 📱 **Mobile First**: Optimizado para dispositivos móviles
- 🎨 **UI Moderna**: Interfaz intuitiva con Tailwind CSS
- 🔒 **Seguro**: Transacciones en blockchain con smart contracts

## 🛠️ **Tecnologías**

- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **Ethers.js** para Web3
- **Base Network** (Chain ID: 8453)
- **USDC** como stablecoin principal

## 🚀 **Instalación y Desarrollo**

### **Prerrequisitos**
- Node.js >= 18.0.0
- npm >= 8.0.0
- MetaMask instalado
- Base Network configurada en MetaMask

### **Instalación**
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/splitpay-base-miniapp.git
cd splitpay-base-miniapp

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### **Abrir en el Navegador**
```
http://localhost:3000
```

## ⚙️ **Configuración**

### **Base Network en MetaMask**
1. Abre MetaMask
2. Ve a Settings > Networks > Add Network
3. Configura:
   - **Network Name**: Base
   - **RPC URL**: https://mainnet.base.org
   - **Chain ID**: 8453
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://basescan.org

### **Variables de Entorno**
```env
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_USDC_CONTRACT_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

## 🎯 **Uso**

### **1. Conectar Wallet**
- Conecta tu wallet de MetaMask
- Asegúrate de estar en Base Network
- Acepta la conexión

### **2. Crear Grupo**
- Haz clic en "Crear Grupo"
- Completa la información
- Agrega participantes
- Configura método de división

### **3. Agregar Gastos**
- Ve al grupo creado
- Agrega gastos con descripción y monto
- Los gastos se dividen automáticamente

## 📱 **Base Mini App**

### **Configuración del Manifest**
El archivo `minikit.config.ts` contiene la configuración para Base Mini Apps:

```typescript
export const minikitConfig = {
  miniapp: {
    name: "SplitPay",
    description: "Divide gastos con amigos usando USDC en Base",
    // ... más configuración
  }
}
```

### **Assets Requeridos**
- `icon.png` - Icono de la app (512x512)
- `splash.png` - Imagen de splash (1080x1920)
- `screenshot-portrait.png` - Captura vertical
- `screenshot-landscape.png` - Captura horizontal
- `hero.png` - Imagen hero
- `og-image.png` - Imagen para redes sociales

## 🚀 **Deploy**

### **Vercel (Recomendado)**
1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### **Variables de Entorno en Vercel**
```
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_USDC_CONTRACT_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

## 🧪 **Scripts Disponibles**

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build

# Calidad de Código
npm run lint         # Linter
npm run type-check   # Verificación de tipos
```

## 🌐 **Base Network**

### **Información de la Red**
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org
- **Currency**: ETH
- **USDC Contract**: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

### **Ventajas de Base**
- ⚡ **Rápido**: Transacciones en segundos
- 💰 **Económico**: Comisiones muy bajas
- 🔒 **Seguro**: Layer 2 de Ethereum
- 🌍 **Global**: Accesible desde cualquier lugar

## 📊 **Funcionalidades**

### **Gestión de Grupos**
- ✅ Crear grupos de gastos
- ✅ Agregar participantes
- ✅ Configurar métodos de división
- ✅ Seguimiento de gastos

### **División de Gastos**
- ✅ División igualitaria
- ✅ División proporcional
- ✅ División personalizada
- ✅ Cálculo automático de deudas

### **Web3 Integration**
- ✅ Conexión con MetaMask
- ✅ Transacciones en Base
- ✅ USDC como stablecoin
- ✅ Historial en blockchain

## 🔒 **Seguridad**

### **Mejores Prácticas**
- ✅ Verifica siempre la URL del sitio
- ✅ Revisa transacciones antes de confirmar
- ✅ Usa solo Base Network
- ✅ Mantén privadas tus claves de wallet

### **Qué NO hacer**
- ❌ Compartir tu frase semilla
- ❌ Confirmar transacciones sin revisar
- ❌ Usar redes no verificadas
- ❌ Dejar fondos en wallets de intercambio

## 🤝 **Contribuir**

### **Cómo Contribuir**
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### **Estándares de Código**
- Usa TypeScript para todo el código
- Sigue las reglas de ESLint
- Escribe tests para nuevas funcionalidades
- Documenta cambios importantes

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 **Autor**

**Facundo Medina**
- GitHub: [@facundomedina](https://github.com/facundomedina)
- Twitter: [@facundomedina](https://twitter.com/facundomedina)

## 🙏 **Agradecimientos**

- [Base](https://base.org/) - Por la increíble Layer 2
- [React](https://reactjs.org/) - Por la increíble librería
- [Ethers.js](https://docs.ethers.org/) - Por la integración Web3
- [Tailwind CSS](https://tailwindcss.com/) - Por el sistema de diseño
- [Vite](https://vitejs.dev/) - Por la experiencia de desarrollo

---

<div align="center">

**⭐ Si te gusta este proyecto, ¡dale una estrella! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/facundomedina/splitpay-base-miniapp?style=social)](https://github.com/facundomedina/splitpay-base-miniapp/stargazers)

</div>
# Force Vercel redeploy Tue Sep 23 19:03:22 -03 2025

