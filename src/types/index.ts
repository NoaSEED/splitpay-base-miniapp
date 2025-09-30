// ===========================================
// Core Data Types for SplitPay
// ===========================================

export interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string // Wallet address of the person who paid
  createdAt: string
  status: 'active' | 'cancelled'
  groupId: string
}

export interface Payment {
  id: string
  from: string // Wallet address of the person who owes
  to: string // Wallet address of the person to be paid
  amount: number
  status: 'pending' | 'completed' | 'disputed' | 'cancelled'
  transactionHash?: string // Hash of the transaction on Base
  createdAt: string
  completedAt?: string
  completedBy?: string // Wallet address of the person who marked it as completed
  notes?: string
  proofImage?: string // Image proof of payment
}

export interface Notification {
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

export interface Group {
  id: string
  name: string
  description: string
  currency: 'USDC' // Only USDC on Base
  category: string
  startDate: string
  endDate?: string
  divisionMethod: 'equal' // For now, only equal division
  participants: string[] // Array of wallet addresses
  participantNames: { [address: string]: string } // Map of address to custom name
  createdAt: string
  status: 'active' | 'completed' | 'archived'
  totalAmount: number // Total amount spent in the group
  expenses: Expense[]
  payments: Payment[]
  contractAddress?: string // Optional: if a smart contract is deployed for the group
}

// ===========================================
// Web3 Types
// ===========================================

export interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  color: string
  enabled: boolean
}

export interface Web3State {
  account: string | null
  chainId: number | null
  isConnected: boolean
  isLoading: boolean
  provider: unknown
  signer: unknown
}

// ===========================================
// Form Types
// ===========================================

export interface CreateGroupForm {
  name: string
  description: string
  category: string
  participants: string[]
}

export interface AddExpenseForm {
  description: string
  amount: number
  paidBy: string
}

export interface AddParticipantForm {
  address: string
  name?: string
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ===========================================
// Utility Types
// ===========================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  key: string
  order: SortOrder
}






