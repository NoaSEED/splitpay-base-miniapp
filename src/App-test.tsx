import React from 'react'

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>
        🎉 SplitPay - Test Ultra Simple
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        margin: '20px auto',
        maxWidth: '600px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ Estado del Sistema:</h2>
        <ul style={{ fontSize: '18px', lineHeight: '1.6' }}>
          <li>✅ Servidor funcionando en puerto 3000</li>
          <li>✅ React cargando correctamente</li>
          <li>✅ JavaScript ejecutándose</li>
          <li>✅ HTML renderizando</li>
        </ul>
        
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '15px',
          margin: '20px 0',
          borderRadius: '5px',
          border: '1px solid #4caf50'
        }}>
          <strong>🎯 Si ves esto, el problema NO es React</strong>
        </div>
        
        <p style={{ fontSize: '16px', color: '#666' }}>
          <strong>Timestamp:</strong> {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default App
