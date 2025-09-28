# 📚 SplitPay - Documentación Técnica

## 🏗 **ARQUITECTURA**

### **Stack Tecnológico**
- **Frontend**: React 18 + TypeScript
- **Bundler**: Vite 5
- **Styling**: Tailwind CSS
- **Web3**: Ethers.js v6
- **Routing**: React Router DOM v6
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Network**: Base (Chain ID: 8453)

### **Estructura de Directorios**
```
src/
├── components/          # Componentes reutilizables
│   ├── OptimizedInput.tsx
│   ├── OptimizedButton.tsx
│   ├── OptimizedCard.tsx
│   ├── FormValidation.tsx
│   ├── WalletConnect.tsx
│   └── ...
├── contexts/           # Contextos de estado
│   ├── Web3Context.tsx
│   └── GroupContext.tsx
├── hooks/              # Hooks personalizados
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useNotifications.ts
│   ├── usePerformance.ts
│   └── useAccessibility.ts
├── pages/              # Páginas principales
│   ├── Dashboard.tsx
│   ├── CreateGroup.tsx
│   └── GroupDetail.tsx
├── types/              # Definiciones TypeScript
│   ├── index.ts
│   └── global.d.ts
├── utils/              # Utilidades
│   └── index.ts
├── constants/          # Constantes
│   └── index.ts
├── App.tsx
└── main.tsx
```

## 🔧 **CONTEXTOS DE ESTADO**

### **Web3Context**
Maneja toda la lógica de conexión Web3:

```typescript
interface Web3ContextType {
  // Estado de conexión
  account: string | null
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  isLoading: boolean
  
  // Gestión de red
  currentNetwork: NetworkConfig | null
  supportedNetworks: NetworkConfig[]
  isBaseNetwork: boolean
  
  // Acciones
  connectWallet: (walletType?) => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  addNetwork: (chainId: number) => Promise<void>
}
```

**Características**:
- Soporte para múltiples wallets (MetaMask, Rabby, Coinbase, Trust)
- Detección automática de red Base
- Manejo robusto de errores
- Event listeners para cambios de cuenta/red
- Memoización para optimizar re-renders

### **GroupContext**
Gestiona grupos, gastos y pagos:

```typescript
interface GroupContextType {
  // Estado de grupos
  groups: Group[]
  currentGroup: Group | null
  isLoading: boolean
  
  // Acciones de grupos
  createGroup: (groupData: CreateGroupForm) => Promise<boolean>
  addExpense: (groupId: string, expenseData: AddExpenseForm) => Promise<boolean>
  deleteExpense: (groupId: string, expenseId: string) => Promise<boolean>
  
  // Gestión de pagos
  createPayment: (groupId: string, from: string, to: string, amount: number) => Promise<boolean>
  completePayment: (groupId: string, paymentId: string, transactionHash: string, completedBy: string) => Promise<boolean>
  
  // Utilidades
  getGroupsByParticipant: (address: string) => Group[]
  getTotalOwed: (groupId: string, participant: string) => number
}
```

**Características**:
- Persistencia en localStorage
- Cálculo automático de balances
- Notificaciones automáticas
- Validación de datos
- Manejo de errores robusto

## 🎣 **HOOKS PERSONALIZADOS**

### **useDebounce**
Debounce de valores y callbacks para optimizar performance:

```typescript
const debouncedValue = useDebounce(value, 300)
const debouncedCallback = useDebouncedCallback(callback, 300)
```

### **useLocalStorage**
Manejo de localStorage con TypeScript y TTL:

```typescript
const [data, setData, removeData] = useLocalStorage<MyType>('key', defaultValue)
const [dataWithTTL, setDataWithTTL, removeDataWithTTL] = useStorageWithTTL<MyType>('key', defaultValue, 60) // 60 minutos
```

### **useNotifications**
Gestión completa de notificaciones:

```typescript
const {
  notifications,
  unreadNotifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationsByType,
  clearOldNotifications
} = useNotifications(address)
```

### **usePerformance**
Monitoreo de rendimiento:

```typescript
const { logPerformance, resetTimer, renderCount } = usePerformance()
```

### **useAccessibility**
Funciones de accesibilidad:

```typescript
const {
  focusElement,
  announceToScreenReader,
  handleKeyDown,
  checkColorContrast
} = useAccessibility()
```

## 🧩 **COMPONENTES OPTIMIZADOS**

### **OptimizedInput**
Input con validación y estados:

```typescript
<OptimizedInput
  label="Dirección de Wallet"
  value={address}
  onChange={setAddress}
  error={errors.address}
  success={isValid}
  leftIcon={<Wallet />}
  placeholder="0x..."
  required
/>
```

**Características**:
- Validación en tiempo real
- Estados visuales (error, success, disabled)
- Iconos izquierda/derecha
- Accesibilidad completa
- Forward ref para integración con formularios

### **OptimizedButton**
Botón con variantes y loading:

```typescript
<OptimizedButton
  variant="primary"
  size="md"
  loading={isLoading}
  leftIcon={<Plus />}
  fullWidth
  onClick={handleClick}
>
  Crear Grupo
</OptimizedButton>
```

**Variantes**:
- `primary`: Azul Base (#0052FF)
- `secondary`: Gris claro
- `danger`: Rojo para acciones destructivas
- `ghost`: Transparente

**Tamaños**:
- `sm`: Pequeño (px-3 py-1.5)
- `md`: Mediano (px-4 py-2)
- `lg`: Grande (px-6 py-3)

### **OptimizedCard**
Tarjeta reutilizable:

```typescript
<OptimizedCard
  padding="md"
  shadow="sm"
  border
  hover
  onClick={handleClick}
>
  Contenido de la tarjeta
</OptimizedCard>
```

### **FormValidation**
Sistema de validación de formularios:

```typescript
<FormValidation
  onSubmit={handleSubmit}
  validationRules={VALIDATION_RULES.groupName}
  isSubmitting={isLoading}
>
  <FormField
    name="groupName"
    label="Nombre del Grupo"
    type="text"
    validation={VALIDATION_RULES.required}
  />
</FormValidation>
```

## 🔒 **TIPOS TYPESCRIPT**

### **Tipos Principales**

```typescript
interface Group {
  id: string
  name: string
  description: string
  currency: 'USDC'
  category: string
  startDate: string
  endDate?: string
  divisionMethod: 'equal'
  participants: string[]
  participantNames: { [address: string]: string }
  createdAt: string
  status: 'active' | 'completed' | 'archived'
  totalAmount: number
  expenses: Expense[]
  payments: Payment[]
  contractAddress?: string
}

interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  createdAt: string
  status: 'active' | 'cancelled'
  groupId: string
}

interface Payment {
  id: string
  from: string
  to: string
  amount: number
  status: 'pending' | 'completed' | 'disputed' | 'cancelled'
  transactionHash?: string
  createdAt: string
  completedAt?: string
  completedBy?: string
  notes?: string
}

interface Notification {
  id: string
  type: 'expense_added' | 'payment_completed' | 'debt_reminder'
  groupId: string
  groupName: string
  message: string
  amount?: number
  from?: string
  to?: string
  timestamp: string
  read: boolean
}
```

## 🌐 **CONFIGURACIÓN DE RED**

### **Base Network**
```typescript
export const BASE_NETWORK = {
  chainId: 8453,
  name: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  color: '#0052FF',
  enabled: true,
}
```

### **Base Sepolia (Desarrollo)**
```typescript
export const BASE_SEPOLIA_NETWORK = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  // ... configuraciones similares
  enabled: import.meta.env.DEV,
}
```

## 📱 **RESPONSIVE DESIGN**

### **Breakpoints Tailwind**
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+

### **Estrategia Mobile-First**
```css
/* Ejemplo de componente responsive */
.container {
  @apply px-4 py-2;           /* Mobile */
  @apply md:px-6 md:py-4;     /* Tablet */
  @apply lg:px-8 lg:py-6;     /* Desktop */
}
```

## 🚀 **OPTIMIZACIONES DE RENDIMIENTO**

### **Code Splitting**
```typescript
// Lazy loading de páginas
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CreateGroup = lazy(() => import('./pages/CreateGroup'))
const GroupDetail = lazy(() => import('./pages/GroupDetail'))
```

### **Memoización**
```typescript
// Contextos memoizados
const value = useMemo(() => ({
  // ... valores del contexto
}), [dependencies])

// Componentes memoizados
const MemoizedComponent = memo(Component)
```

### **Debounce**
```typescript
// Inputs con debounce
const debouncedSearch = useDebounce(searchTerm, 300)
```

## 🔍 **VALIDACIONES**

### **Validación de Direcciones Ethereum**
```typescript
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
```

### **Validación de Montos**
```typescript
export const isValidAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 10000
}
```

### **Reglas de Validación**
```typescript
export const VALIDATION_RULES = {
  required: { required: true },
  groupName: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_]+$/
  },
  ethAddress: {
    required: true,
    pattern: /^0x[a-fA-F0-9]{40}$/,
    custom: (value: string) => {
      if (!isValidAddress(value)) {
        return 'Dirección Ethereum inválida'
      }
      return null
    }
  }
}
```

## 🧪 **TESTING**

### **Estructura Preparada**
```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── contexts/
├── __mocks__/
└── setupTests.ts
```

### **Ejemplo de Test**
```typescript
import { render, screen } from '@testing-library/react'
import { OptimizedButton } from '../OptimizedButton'

test('renders button with loading state', () => {
  render(<OptimizedButton loading>Loading...</OptimizedButton>)
  expect(screen.getByRole('button')).toBeDisabled()
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})
```

## 📦 **BUILD Y DEPLOYMENT**

### **Vite Configuration**
```typescript
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ethers: ['ethers'],
          ui: ['lucide-react', 'react-hot-toast']
        }
      }
    }
  }
})
```

### **Scripts de Build**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix"
  }
}
```

## 🔐 **SEGURIDAD**

### **Validación de Inputs**
- Sanitización de datos de entrada
- Validación de tipos TypeScript
- Límites de caracteres y valores

### **Manejo de Errores**
- Try-catch en todas las operaciones async
- Mensajes de error user-friendly
- Logging de errores para debugging

### **LocalStorage Seguro**
- Validación de datos al cargar
- Manejo de errores de parsing
- Fallbacks para datos corruptos

## 📊 **MONITOREO Y ANALYTICS**

### **Performance Monitoring**
```typescript
// Ejemplo de uso
const { logPerformance } = usePerformance()

useEffect(() => {
  logPerformance('Dashboard')
}, [])
```

### **Error Tracking**
```typescript
// Ejemplo de manejo de errores
try {
  await riskyOperation()
} catch (error) {
  console.error('Error en operación:', error)
  // Aquí se puede integrar Sentry, LogRocket, etc.
}
```

## 🚀 **PRÓXIMAS MEJORAS**

1. **Testing E2E** - Cypress o Playwright
2. **Storybook** - Documentación de componentes
3. **PWA** - Service Worker y offline support
4. **Analytics** - Google Analytics o Mixpanel
5. **Error Tracking** - Sentry integration
6. **Performance Monitoring** - Web Vitals tracking
7. **A/B Testing** - Optimizely o similar
8. **Internationalization** - react-i18next

## 📞 **SOPORTE**

Para preguntas técnicas o reportar bugs:
- **GitHub Issues**: [Link al repositorio]
- **Documentación**: Este archivo
- **Ejemplos**: Ver componentes en `/src/components/`

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Autor**: Equipo SplitPay


