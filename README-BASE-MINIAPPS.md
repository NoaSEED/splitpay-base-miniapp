# SplitPay - Base Mini App

## 🚀 Configuración para Base Mini Apps

### 1. **Registro en Base.app** ✅
- [x] Cuenta creada en Base.app
- [x] Acceso a la plataforma de desarrolladores

### 2. **Configuración del Proyecto** ✅
- [x] Manifest configurado (`minikit.config.ts`)
- [x] Imágenes creadas (icon, splash)
- [x] Webhook endpoint configurado
- [x] Scripts de Base agregados

### 3. **Próximos Pasos en Base.app**

#### **Paso 1: Crear Mini App**
1. Ve a tu dashboard en Base.app
2. Busca la sección "Mini Apps" o "Create Mini App"
3. Haz clic en "Create New Mini App"

#### **Paso 2: Configurar Mini App**
1. **Nombre**: `SplitPay`
2. **Descripción**: `Divide gastos con amigos usando USDC en Base Network`
3. **Categoría**: `Finance`
4. **URL de la App**: `https://splitpay-base-miniapp.vercel.app`
5. **Webhook URL**: `https://splitpay-base-miniapp.vercel.app/api/webhook`

#### **Paso 3: Subir Imágenes**
1. **Icon**: Usar `public/icon.png`
2. **Splash Screen**: Usar `public/splash.png`
3. **Screenshots**: Capturas de pantalla de la app

#### **Paso 4: Configurar Permisos**
1. **Wallet Connection**: Habilitado
2. **Transaction Signing**: Habilitado
3. **Network Access**: Base Network

#### **Paso 5: Obtener Credenciales**
1. **App ID**: Se generará automáticamente
2. **API Key**: Se generará para autenticación
3. **Webhook Secret**: Para verificar webhooks

### 4. **Variables de Entorno**

Agregar a Vercel:
```
BASE_APP_ID=tu_app_id_aqui
BASE_API_KEY=tu_api_key_aqui
BASE_WEBHOOK_SECRET=tu_webhook_secret_aqui
```

### 5. **Testing**

1. **Local**: `npm run dev` → `http://localhost:3000`
2. **Staging**: `npm run build && npm run preview`
3. **Production**: Vercel auto-deploy

### 6. **Documentación Base Mini Apps**

- [Base Mini Apps Docs](https://docs.base.org/mini-apps/)
- [Quickstart Guide](https://docs.base.org/mini-apps/quickstart/)
- [API Reference](https://docs.base.org/mini-apps/api/)

## 🎯 Estado Actual

- ✅ **App funcionando** en Vercel
- ✅ **Base.app cuenta** creada
- ✅ **Manifest** configurado
- ✅ **Imágenes** creadas
- ✅ **Webhook** configurado
- ⏳ **Pendiente**: Configurar en Base.app dashboard

## 📞 Siguiente Acción

**Ve a Base.app y crea tu Mini App con la información de arriba**
