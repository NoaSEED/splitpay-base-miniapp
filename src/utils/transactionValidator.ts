// ===========================================
// Transaction Validation Utilities
// ===========================================

import { ethers } from 'ethers'

// ===========================================
// Types
// ===========================================

export interface TransactionValidationResult {
  isValid: boolean
  error?: string
  transactionData?: {
    from: string
    to: string
    value: string
    status: number
    blockNumber: number
    gasUsed: string
  }
}

// ===========================================
// Base Network Configuration
// ===========================================

const BASE_CHAIN_ID = 8453
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC en Base

// ===========================================
// Transaction Validation Function
// ===========================================

export const validateTransaction = async (
  transactionHash: string,
  expectedFrom: string,
  expectedTo: string,
  expectedAmount: number,
  provider: ethers.BrowserProvider
): Promise<TransactionValidationResult> => {
  try {
    // 1. Validar formato del hash
    if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
      return {
        isValid: false,
        error: 'Formato de hash de transacción inválido'
      }
    }

    // 2. Obtener la transacción
    const transaction = await provider.getTransaction(transactionHash)
    if (!transaction) {
      return {
        isValid: false,
        error: 'Transacción no encontrada en la blockchain'
      }
    }

    // 3. Obtener el recibo de la transacción
    const receipt = await provider.getTransactionReceipt(transactionHash)
    if (!receipt) {
      return {
        isValid: false,
        error: 'Recibo de transacción no encontrado'
      }
    }

    // 4. Verificar que la transacción fue exitosa
    if (receipt.status !== 1) {
      return {
        isValid: false,
        error: 'La transacción falló en la blockchain'
      }
    }

    // 5. Verificar la red (Base)
    const network = await provider.getNetwork()
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      return {
        isValid: false,
        error: `Transacción no está en Base Network (Chain ID: ${Number(network.chainId)})`
      }
    }

    // 6. Verificar el remitente
    if (transaction.from.toLowerCase() !== expectedFrom.toLowerCase()) {
      return {
        isValid: false,
        error: `El remitente no coincide. Esperado: ${expectedFrom}, Encontrado: ${transaction.from}`
      }
    }

    // 7. Verificar si es transacción USDC o ETH directa
    const isUSDCTx = transaction.to?.toLowerCase() === USDC_ADDRESS.toLowerCase()
    const expectedAmountWei = ethers.parseUnits(expectedAmount.toString(), 6) // USDC tiene 6 decimales
    
    if (isUSDCTx) {
      // 7a. Es una transacción USDC - verificar eventos de Transfer
      const transferTopic = ethers.id('Transfer(address,address,uint256)')
      const transferLog = receipt.logs.find(log => 
        log.topics[0] === transferTopic &&
        log.address.toLowerCase() === USDC_ADDRESS.toLowerCase()
      )

      if (!transferLog) {
        return {
          isValid: false,
          error: 'No se encontró evento de transferencia USDC'
        }
      }

      // Decodificar el evento Transfer
      // topics[1] = from, topics[2] = to, data = amount
      const fromAddress = ethers.getAddress('0x' + transferLog.topics[1].slice(26)) // Remover 0x y padding
      const toAddress = ethers.getAddress('0x' + transferLog.topics[2].slice(26)) // Remover 0x y padding
      const transferAmount = ethers.getBigInt(transferLog.data)

      // Verificar que el from del evento coincida con el remitente esperado
      if (fromAddress.toLowerCase() !== expectedFrom.toLowerCase()) {
        return {
          isValid: false,
          error: `El remitente del evento USDC no coincide. Esperado: ${expectedFrom}, Encontrado: ${fromAddress}`
        }
      }

      // Verificar que el to del evento coincida con el destinatario esperado
      if (toAddress.toLowerCase() !== expectedTo.toLowerCase()) {
        return {
          isValid: false,
          error: `El destinatario del evento USDC no coincide. Esperado: ${expectedTo}, Encontrado: ${toAddress}`
        }
      }

      // Verificar el monto del evento
      if (transferAmount !== expectedAmountWei) {
        return {
          isValid: false,
          error: `Monto USDC no coincide. Esperado: ${expectedAmount} USDC, Encontrado: ${ethers.formatUnits(transferAmount, 6)} USDC`
        }
      }

      console.log('✅ Validación USDC exitosa:', {
        from: fromAddress,
        to: toAddress,
        amount: ethers.formatUnits(transferAmount, 6) + ' USDC'
      })

    } else {
      // 7b. Es una transacción ETH directa
      if (transaction.to?.toLowerCase() !== expectedTo.toLowerCase()) {
        return {
          isValid: false,
          error: `El destinatario ETH no coincide. Esperado: ${expectedTo}, Encontrado: ${transaction.to}`
        }
      }

      // Verificar el monto ETH
      const expectedAmountWeiETH = ethers.parseEther(expectedAmount.toString())
      if (transaction.value !== expectedAmountWeiETH) {
        const actualAmount = ethers.formatEther(transaction.value)
        return {
          isValid: false,
          error: `Monto ETH no coincide. Esperado: ${expectedAmount} ETH, Encontrado: ${actualAmount} ETH`
        }
      }

      console.log('✅ Validación ETH exitosa:', {
        from: transaction.from,
        to: transaction.to,
        amount: ethers.formatEther(transaction.value) + ' ETH'
      })
    }

    // ✅ Todas las validaciones pasaron
    return {
      isValid: true,
      transactionData: {
        from: transaction.from,
        to: isUSDCTx ? expectedTo : (transaction.to || ''), // Para USDC, usar el destinatario real del evento
        value: isUSDCTx ? ethers.formatUnits(expectedAmountWei, 6) + ' USDC' : ethers.formatEther(transaction.value) + ' ETH',
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    }

  } catch (error: unknown) {
    console.error('Error validating transaction:', error)
    
    if (error instanceof Error) {
      return {
        isValid: false,
        error: `Error de validación: ${error.message}`
      }
    }
    
    return {
      isValid: false,
      error: 'Error desconocido durante la validación'
    }
  }
}

// ===========================================
// Helper Functions
// ===========================================

export const getTransactionUrl = (hash: string): string => {
  return `https://basescan.org/tx/${hash}`
}

export const isValidTransactionHash = (hash: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}




