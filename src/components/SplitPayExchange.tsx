import React from 'react'
import { X, ArrowLeftRight, DollarSign } from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'
import { useLanguage } from '../contexts/LanguageContext'

interface SplitPayExchangeProps {
  isOpen: boolean
  onClose: () => void
}

const SplitPayExchange: React.FC<SplitPayExchangeProps> = ({ isOpen, onClose }) => {
  const { account } = useWeb3()
  const { t } = useLanguage()

  if (!isOpen) return null

  // Token addresses for Base Network
  const TOKEN_ADDRESSES = {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    WETH: '0x4200000000000000000000000000000000000006'
  }

  // Function to open Uniswap with specific tokens
  const openUniswapSwap = (inputCurrency: string, outputCurrency: string) => {
    const uniswapUrl = `https://app.uniswap.org/#/swap?chain=base&inputCurrency=${inputCurrency}&outputCurrency=${outputCurrency}`
    window.open(uniswapUrl, '_blank', 'width=1200,height=800')
  }


  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '400px',
          width: '90%',
          margin: '0 16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 100000
        }}
      >
        {/* Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(to right, #3b82f6, #2563eb)',
            color: 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeftRight size={20} color="white" />
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              🦄 SplitPay Exchange
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} color="white" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#6b7280', marginBottom: '8px', margin: 0 }}>
              Encuentra el mejor precio para tus tokens
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span>Powered by Uniswap</span>
            </div>
          </div>

          {/* Swap Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* USDC to ETH */}
            <button
              onClick={() => openUniswapSwap(TOKEN_ADDRESSES.USDC, TOKEN_ADDRESSES.WETH)}
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#93c5fd'
                e.currentTarget.style.backgroundColor = '#eff6ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={16} color="#2563eb" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>USDC → ETH</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Para gas fees</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', backgroundColor: '#dbeafe', color: '#2563eb', padding: '2px 6px', borderRadius: '4px' }}>🦄 Uni</span>
                  <ArrowLeftRight size={16} color="#9ca3af" />
                </div>
              </div>
            </button>

            {/* ETH to USDC */}
            <button
              onClick={() => openUniswapSwap(TOKEN_ADDRESSES.WETH, TOKEN_ADDRESSES.USDC)}
              style={{
                width: '100%',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#93c5fd'
                e.currentTarget.style.backgroundColor = '#eff6ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>E</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>ETH → USDC</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Para pagar deudas</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', backgroundColor: '#dbeafe', color: '#2563eb', padding: '2px 6px', borderRadius: '4px' }}>🦄 Uni</span>
                  <ArrowLeftRight size={16} color="#9ca3af" />
                </div>
              </div>
            </button>
          </div>

          {/* Info */}
          <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ fontSize: '16px', marginTop: '2px' }}>ℹ️</div>
              <div style={{ fontSize: '14px', color: '#1d4ed8' }}>
                <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>¿Por qué usar Uniswap?</p>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px' }}>
                  <li>• DEX más establecido y confiable</li>
                  <li>• Gran liquidez en Base Network</li>
                  <li>• Interfaz intuitiva y familiar</li>
                  <li>• Transacciones seguras y rápidas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              color: '#374151',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default SplitPayExchange
