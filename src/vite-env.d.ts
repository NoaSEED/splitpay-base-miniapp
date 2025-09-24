/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    on: (event: string, callback: (...args: any[]) => void) => void
    removeListener: (event: string, callback: (...args: any[]) => void) => void
  }
}

interface ImportMetaEnv {
  readonly VITE_BASE_RPC_URL: string
  readonly VITE_USDC_CONTRACT_BASE: string
  readonly NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

