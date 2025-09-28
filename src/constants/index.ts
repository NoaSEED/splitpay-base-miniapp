// ===========================================
// Network Configuration
// ===========================================

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

export const BASE_SEPOLIA_NETWORK = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  color: '#0052FF',
  enabled: import.meta.env.DEV, // Only enabled in development
}

export const SUPPORTED_NETWORKS = [
  BASE_NETWORK,
  BASE_SEPOLIA_NETWORK,
].filter(network => network.enabled);

// ===========================================
// Storage Keys
// ===========================================

export const STORAGE_KEYS = {
  GROUPS: 'splitpay-groups',
  NOTIFICATIONS_PREFIX: 'notifications_', // notifications_0xabc...
  SETTINGS: 'splitpay-settings',
}

// ===========================================
// Messages
// ===========================================

export const ERROR_MESSAGES = {
  METAMASK_NOT_INSTALLED: 'MetaMask no está instalado. Por favor, instala MetaMask para continuar.',
  CONNECTION_CANCELLED: 'Conexión cancelada por el usuario.',
  CONNECTION_IN_PROGRESS: 'Conexión ya en progreso. Por favor, espera.',
  UNSUPPORTED_NETWORK: 'Red no soportada. Por favor, cambia a la red Base.',
  GENERIC_CONNECTION_ERROR: 'Error al conectar wallet:',
  ADD_NETWORK_CANCELLED: 'Agregar red cancelado por el usuario.',
  GENERIC_ADD_NETWORK_ERROR: 'Error al agregar la red:',
  GROUP_NOT_FOUND: 'Grupo no encontrado.',
  INVALID_ADDRESS: 'Por favor, ingresa una dirección de wallet válida.',
  PARTICIPANT_ALREADY_ADDED: 'Este participante ya está en el grupo.',
  CANNOT_ADD_SELF: 'No puedes agregarte a ti mismo como participante.',
  EMPTY_GROUP_NAME: 'Por favor, ingresa un nombre para el grupo.',
  NO_PARTICIPANTS: 'Por favor, agrega al menos un participante.',
  EMPTY_EXPENSE_DESCRIPTION: 'Por favor, ingresa una descripción para el gasto.',
  INVALID_EXPENSE_AMOUNT: 'Por favor, ingresa un monto válido para el gasto.',
  NO_PAYER_SELECTED: 'Por favor, selecciona quién pagó el gasto.',
  PAYMENT_NOT_FOUND: 'Pago no encontrado.',
  EMPTY_TRANSACTION_HASH: 'Por favor, ingresa el hash de la transacción.',
  NOTIFICATION_NOT_FOUND: 'Notificación no encontrada.',
}

export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet conectada en',
  WALLET_DISCONNECTED: 'Wallet desconectada.',
  NETWORK_SWITCHED: 'Cambiado a',
  NETWORK_ADDED: 'agregada exitosamente.',
  GROUP_CREATED: 'Grupo creado exitosamente.',
  EXPENSE_ADDED: 'Gasto agregado.',
  EXPENSE_DELETED: 'Gasto eliminado.',
  EXPENSE_CANCELLED: 'Gasto cancelado.',
  DEBT_CANCELLED: 'Deuda cancelada.',
  GROUP_UPDATED: 'Grupo actualizado.',
  GROUP_DELETED: 'Grupo eliminado.',
  PARTICIPANT_NAME_ADDED: 'Nombre agregado para',
  PAYMENT_CREATED: 'Pago creado.',
  PAYMENT_COMPLETED: 'Pago marcado como completado.',
  NOTIFICATION_READ: 'Notificación marcada como leída.',
  ALL_NOTIFICATIONS_READ: 'Todas las notificaciones marcadas como leídas.',
}

// ===========================================
// UI Constants
// ===========================================

export const UI_CONSTANTS = {
  MAX_GROUP_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 200,
  MAX_PARTICIPANTS: 20,
  MIN_EXPENSE_AMOUNT: 0.01,
  MAX_EXPENSE_AMOUNT: 10000,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 4000,
}

// ===========================================
// Validation Patterns
// ===========================================

export const VALIDATION_PATTERNS = {
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  GROUP_NAME: /^[a-zA-Z0-9\s\-_]{1,50}$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/,
}


