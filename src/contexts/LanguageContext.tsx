import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// ===========================================
// Types
// ===========================================

export type Language = 'es' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  translateNotification: (key: string, params?: Record<string, string | number>) => string
}

// ===========================================
// Translations
// ===========================================

const translations = {
  es: {
    // Common
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.loading': 'Cargando...',
    'common.processing': 'Procesando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.copy': 'Copiar',
    'common.back': 'Volver',
    'common.create': 'Crear',
    'common.creating': 'Creando...',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.create_group': 'Crear Grupo',
    'nav.back_dashboard': 'Volver al Dashboard',
    
    // App Branding
    'app.name': 'SplitPay',
    'app.copyright': '© 2024 SplitPay',
    
    // Payment
    'payment.pay': 'Pagar',
    'payment.complete': 'Completar Pago',
    'payment.transaction_hash': 'Hash de Transacción',
    'payment.transaction_hash_required': 'Por favor ingresa el hash de la transacción',
    'payment.transaction_hash_invalid': 'Por favor ingresa un hash de transacción válido (0x...)',
    'payment.transaction_hash_invalid_format': 'Por favor ingresa un hash de transacción válido (0x + 64 caracteres)',
    'payment.validate_success': '✅ Transacción validada correctamente',
    'payment.validate_failed': 'Transacción inválida',
    'payment.completed_success': '¡Pago completado!',
    'payment.enter_hash': 'Ingresa el hash de la transacción',
    'payment.verification': 'Verificación de Pago',
    'payment.verification_desc': 'Una vez completado, el saldo se actualizará automáticamente y se notificará a todos los participantes.',
    'payment.details': 'Detalles del Pago',
    'payment.verify_transaction': 'Puedes verificar la transacción en',
    
    // Instructions
    'instructions.title': 'Instrucciones:',
    'instructions.step1': '1. Realiza la transacción en tu wallet',
    'instructions.step2': '2. Copia el hash de la transacción',
    'instructions.step3': '3. Pégalo en el campo de arriba',
    'instructions.step4': '4. Haz clic en "Completar Pago"',
    
    // Debt Management
    'debt.cancel': 'Cancelar Deuda',
    'debt.cancel_tooltip': 'Cancelar deuda con este participante',
    'debt.cancel_specific': 'Cancelar Su Deuda',
    'debt.cancel_specific_tooltip': 'Cancelar deuda de este participante',
    'debt.pay_instruction': '1. Haz clic en "Pagar" para la deuda que quieres saldar',
    
    // Participants
    'participants.add_address': 'Por favor ingresa una dirección Ethereum válida (0x...)',
    'participants.add_name': 'Por favor ingresa un nombre',
    'participants.name_label': 'Nombre del participante',
    'participants.name_placeholder': 'Ej: Juan Pérez',
    'participants.wallet_label': 'Dirección de wallet',
    'participants.wallet_placeholder': '0x...',
    'participants.wallet_helper': 'Dirección Ethereum completa (0x + 40 caracteres)',
    'participants.add_button': '+ Agregar',
    'participants.adding': 'Agregando...',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.tip': '💡 Tip: Asegúrate de estar conectado a la red Base para usar SplitPay.',
    'dashboard.create_group': 'Crear Grupo',
    'dashboard.connect_wallet': 'Conecta tu Wallet',
    'dashboard.connect_description': 'Conecta tu wallet de Base para comenzar a dividir gastos con tus amigos.',
    'dashboard.manage_expenses': 'Gestiona tus gastos compartidos en Base',
    'dashboard.create_first_group': 'Crea tu primer grupo para comenzar a dividir gastos con tus amigos.',
    'dashboard.active_groups': 'Grupos Activos',
    'dashboard.total_spent': 'Total Gastado',
    'dashboard.registered_expenses': 'Gastos Registrados',
    'dashboard.my_groups': 'Mis Grupos',
    'dashboard.groups_count': 'grupos',
    
    // Group Card
    'group.status_active': 'Activo',
    'group.participants_label': 'participantes',
    'group.total_spent': 'Total Gastado',
    'group.expenses_label': 'Gastos',
    'group.view_details': 'Ver Detalles',
    'group.division': 'División',
    'group.division_equal': 'equal',
    
    // Group Detail
    'group.connect_wallet': 'Conecta tu Wallet',
    'group.connect_description': 'Necesitas conectar tu wallet para ver los detalles del grupo.',
    'group.add_first_expense': 'Agrega el primer gasto para comenzar a dividir los costos.',
    
    // Group Detail Actions
    'group.add_expense': 'Agregar Gasto',
    'group.delete_group': 'Eliminar Grupo',
    'group.edit_name': 'Editar nombre',
    'group.cancel_debt': 'Cancelar Deuda',
    'group.cancel_debt_tooltip': 'Cancelar deuda con este participante',
    'group.cancel_specific_debt': 'Cancelar Su Deuda',
    'group.cancel_specific_debt_tooltip': 'Cancelar deuda de este participante',
    'group.add_first_expense_button': 'Agregar Primer Gasto',
    'group.paid_by': 'Pagado por',
    'group.cancel_expense': 'Cancelar gasto',
    'group.delete_expense': 'Eliminar gasto',
    'group.amount_usd': 'Monto (USD)',
    'group.adding_expense': 'Agregando...',
    
    // Common Labels
    'common.you': 'Tú',
    'common.participant': 'Participante',
    
    // Debt Management
    'debt.my_debts': 'Mis Deudas',
    'debt.summary_pending': 'Resumen de pagos pendientes',
    'debt.you_owe': 'Debes',
    'debt.they_owe_you': 'Te deben',
    'debt.all_up_to_date': '¡Todo al día!',
    'debt.no_pending_debts': 'No tienes deudas pendientes en este grupo',
    
    // Payment Instructions
    'payment.how_it_works': '¿Cómo funciona el pago?',
    'payment.step1': 'Haz clic en "Pagar" para la deuda que quieres saldar',
    'payment.step2': 'Realiza la transacción en tu wallet',
    'payment.step3': 'Copia el hash de la transacción',
    'payment.step4': 'Pégalo en el formulario y confirma',
    'payment.step5': '¡La deuda se marcará como pagada automáticamente!',
    
    // Expenses Section
    'expenses.title': 'Gastos',
    'expenses.no_expenses': 'No hay gastos aún',
    'expenses.add_first': 'Agrega el primer gasto para comenzar a dividir los costos.',
    'expenses.add_first_button': 'Agregar Primer Gasto',
    
    // Payment History
    'payment.history_title': 'Historial de Pagos',
    'payment.no_payments': 'No hay pagos registrados',
    'payment.will_appear': 'Los pagos aparecerán aquí cuando se agreguen gastos',
    
    // Balance Status
    'balance.in_balance': 'En balance',
    
    // Notifications
    'notifications.title': 'Notificaciones',
    'notifications.clear_all': 'Limpiar todo',
    'notifications.payment_received': '¡Has recibido un pago de {amount} USDC de {from} en "{group}"!',
    'notifications.expense_added': 'Se ha añadido un gasto de {amount} USDC en "{group}"',
    'notifications.time_ago': 'Hace {time}h',
    'notifications.just_now': 'Hace un momento',
    'notifications.minutes_ago': 'Hace {time} min',
    
    // Create Group
    'create.connect_wallet': 'Conecta tu Wallet',
    'create.connect_description': 'Necesitas conectar tu wallet para crear un grupo.',
    'create.description': 'Crea un grupo para dividir gastos con tus amigos usando USDC en Base Network.',
    
    // Debt Management
    'debt.connect_wallet': 'Conecta tu Wallet',
    'debt.connect_description': 'Necesitas conectar tu wallet para ver las deudas',
    
    // Common UI
    'ui.no_groups': 'No tienes grupos aún',
    'ui.no_expenses': 'No hay gastos aún',
    'ui.create_new_group': 'Crear Nuevo Grupo',
    'ui.basic_info': 'Información básica',
    'ui.participants': 'Participantes',
    'ui.add_participant': 'Agregar Participante',
    'ui.participants_and_balances': 'Participantes y Saldos',
    'ui.participants_count': 'Participantes:',
    'ui.group_info': 'Información del Grupo',
    'ui.group_name': 'Nombre del Grupo',
    'ui.description': 'Descripción',
    'ui.category': 'Categoría',
    'ui.start_new_group': 'Inicia un nuevo grupo de gastos',
    'ui.no_participants': 'No hay participantes agregados',
    'ui.add_min_participants': 'Agrega al menos un participante para crear el grupo',
    'ui.remove_participant': 'Eliminar participante',
    
    
    // Footer
    'footer.powered_by': 'Powered by Base Network',
    'footer.copyright': '© 2024 SplitPay',
    'footer.shared_expenses': 'Gastos Compartidos en Base',
    'footer.created_by': 'Creado por',
    'footer.secure_transactions': 'Transacciones seguras en Base',
    'footer.usdc_stable': 'USDC como moneda estable',
    'footer.made_with': 'Hecho con',
    'footer.for_community': 'para la comunidad Base',
    
    // Form placeholders
    'placeholder.group_name': 'Ej: Viaje a Barcelona',
    'placeholder.description': 'Describe el propósito del grupo...',
    
    // Configuration
    'config.title': 'Configuración',
    'config.split_method': 'Método de división',
    'config.equal_split': 'División igual',
    'config.start_date': 'Fecha de inicio',
    'config.end_date': 'Fecha de fin (opcional)',
    'config.date_format': 'dd/mm/aaaa',
    
    // Categories
    'category.general': 'General',
    'category.travel': 'Viaje',
    'category.food': 'Comida',
    'category.entertainment': 'Entretenimiento',
    'category.services': 'Servicios',
    'category.other': 'Otro',
    
    // Instructions (to be removed)
    'instructions.auto_include': 'Tú estás incluido automáticamente como participante',
    'instructions.add_addresses': 'Agrega las direcciones de wallet de tus amigos',
    'instructions.min_participants': 'Mínimo 2 participantes para crear el grupo',
    
    // Language
    'language.spanish': 'Español',
    'language.english': 'English',
    'language.select': 'Idioma'
  },
  en: {
    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.processing': 'Processing...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.copy': 'Copy',
    'common.back': 'Back',
    'common.create': 'Create',
    'common.creating': 'Creating...',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.create_group': 'Create Group',
    'nav.back_dashboard': 'Back to Dashboard',
    
    // App Branding
    'app.name': 'SplitPay',
    'app.copyright': '© 2024 SplitPay',
    
    // Payment
    'payment.pay': 'Pay',
    'payment.complete': 'Complete Payment',
    'payment.transaction_hash': 'Transaction Hash',
    'payment.transaction_hash_required': 'Please enter the transaction hash',
    'payment.transaction_hash_invalid': 'Please enter a valid transaction hash (0x...)',
    'payment.transaction_hash_invalid_format': 'Please enter a valid transaction hash (0x + 64 characters)',
    'payment.validate_success': '✅ Transaction validated successfully',
    'payment.validate_failed': 'Invalid transaction',
    'payment.completed_success': 'Payment completed successfully!',
    'payment.enter_hash': 'Enter the transaction hash',
    'payment.verification': 'Payment Verification',
    'payment.verification_desc': 'Once completed, the balance will be updated automatically and all participants will be notified.',
    'payment.details': 'Payment Details',
    'payment.verify_transaction': 'You can verify the transaction on',
    
    // Instructions
    'instructions.title': 'Instructions:',
    'instructions.step1': '1. Make the transaction in your wallet',
    'instructions.step2': '2. Copy the transaction hash',
    'instructions.step3': '3. Paste it in the field above',
    'instructions.step4': '4. Click "Complete Payment"',
    
    // Debt Management
    'debt.cancel': 'Cancel Debt',
    'debt.cancel_tooltip': 'Cancel debt with this participant',
    'debt.cancel_specific': 'Cancel Their Debt',
    'debt.cancel_specific_tooltip': 'Cancel this participant\'s debt',
    'debt.pay_instruction': '1. Click "Pay" for the debt you want to settle',
    
    // Participants
    'participants.add_address': 'Please enter a valid Ethereum address (0x...)',
    'participants.add_name': 'Please enter a name',
    'participants.name_label': 'Participant Name',
    'participants.name_placeholder': 'E.g: John Doe',
    'participants.wallet_label': 'Wallet Address',
    'participants.wallet_placeholder': '0x...',
    'participants.wallet_helper': 'Complete Ethereum address (0x + 40 characters)',
    'participants.add_button': '+ Add',
    'participants.adding': 'Adding...',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.tip': '💡 Tip: Make sure you\'re connected to Base network to use SplitPay.',
    'dashboard.create_group': 'Create Group',
    'dashboard.connect_wallet': 'Connect Your Wallet',
    'dashboard.connect_description': 'Connect your Base wallet to start splitting expenses with your friends.',
    'dashboard.manage_expenses': 'Manage your shared expenses on Base',
    'dashboard.create_first_group': 'Create your first group to start splitting expenses with your friends.',
    'dashboard.active_groups': 'Active Groups',
    'dashboard.total_spent': 'Total Spent',
    'dashboard.registered_expenses': 'Registered Expenses',
    'dashboard.my_groups': 'My Groups',
    'dashboard.groups_count': 'groups',
    
    // Group Card
    'group.status_active': 'Active',
    'group.participants_label': 'participants',
    'group.total_spent': 'Total Spent',
    'group.expenses_label': 'Expenses',
    'group.view_details': 'View Details',
    'group.division': 'Division',
    'group.division_equal': 'equal',
    
    // Group Detail
    'group.connect_wallet': 'Connect Your Wallet',
    'group.connect_description': 'You need to connect your wallet to view group details.',
    'group.add_first_expense': 'Add the first expense to start splitting costs.',
    
    // Group Detail Actions
    'group.add_expense': 'Add Expense',
    'group.delete_group': 'Delete Group',
    'group.edit_name': 'Edit name',
    'group.cancel_debt': 'Cancel Debt',
    'group.cancel_debt_tooltip': 'Cancel debt with this participant',
    'group.cancel_specific_debt': 'Cancel Their Debt',
    'group.cancel_specific_debt_tooltip': 'Cancel this participant\'s debt',
    'group.add_first_expense_button': 'Add First Expense',
    'group.paid_by': 'Paid by',
    'group.cancel_expense': 'Cancel expense',
    'group.delete_expense': 'Delete expense',
    'group.amount_usd': 'Amount (USD)',
    'group.adding_expense': 'Adding...',
    
    // Common Labels
    'common.you': 'You',
    'common.participant': 'Participant',
    
    // Debt Management
    'debt.my_debts': 'My Debts',
    'debt.summary_pending': 'Summary of pending payments',
    'debt.you_owe': 'You Owe',
    'debt.they_owe_you': 'They Owe You',
    'debt.all_up_to_date': 'All up to date!',
    'debt.no_pending_debts': 'You have no pending debts in this group',
    
    // Payment Instructions
    'payment.how_it_works': 'How does the payment work?',
    'payment.step1': 'Click "Pay" for the debt you want to settle',
    'payment.step2': 'Perform the transaction in your wallet',
    'payment.step3': 'Copy the transaction hash',
    'payment.step4': 'Paste it in the form and confirm',
    'payment.step5': 'The debt will be marked as paid automatically!',
    
    // Expenses Section
    'expenses.title': 'Expenses',
    'expenses.no_expenses': 'No expenses yet',
    'expenses.add_first': 'Add the first expense to start splitting costs.',
    'expenses.add_first_button': 'Add First Expense',
    
    // Payment History
    'payment.history_title': 'Payment History',
    'payment.no_payments': 'No payments registered',
    'payment.will_appear': 'Payments will appear here when expenses are added',
    
    // Balance Status
    'balance.in_balance': 'In balance',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.clear_all': 'Clear all',
    'notifications.payment_received': 'You have received a payment of {amount} USDC from {from} in "{group}"!',
    'notifications.expense_added': 'An expense of {amount} USDC has been added in "{group}"',
    'notifications.time_ago': '{time}h ago',
    'notifications.just_now': 'Just now',
    'notifications.minutes_ago': '{time} min ago',
    
    // Create Group
    'create.connect_wallet': 'Connect Your Wallet',
    'create.connect_description': 'You need to connect your wallet to create a group.',
    'create.description': 'Create a group to split expenses with your friends using USDC on Base Network.',
    
    // Debt Management
    'debt.connect_wallet': 'Connect Your Wallet',
    'debt.connect_description': 'You need to connect your wallet to view debts',
    
    // Common UI
    'ui.no_groups': 'You don\'t have any groups yet',
    'ui.no_expenses': 'No expenses yet',
    'ui.create_new_group': 'Create New Group',
    'ui.basic_info': 'Basic Information',
    'ui.participants': 'Participants',
    'ui.add_participant': 'Add Participant',
    'ui.participants_and_balances': 'Participants and Balances',
    'ui.participants_count': 'Participants:',
    'ui.group_info': 'Group Information',
    'ui.group_name': 'Group Name',
    'ui.description': 'Description',
    'ui.category': 'Category',
    'ui.start_new_group': 'Start a new expense group',
    'ui.no_participants': 'No participants added',
    'ui.add_min_participants': 'Add at least one participant to create the group',
    'ui.remove_participant': 'Remove participant',
    
    
    // Footer
    'footer.powered_by': 'Powered by Base Network',
    'footer.copyright': '© 2024 SplitPay',
    'footer.shared_expenses': 'Shared Expenses on Base',
    'footer.created_by': 'Created by',
    'footer.secure_transactions': 'Secure Transactions on Base',
    'footer.usdc_stable': 'USDC as Stable Currency',
    'footer.made_with': 'Made with',
    'footer.for_community': 'for the Base community',
    
    // Form placeholders
    'placeholder.group_name': 'E.g: Trip to Barcelona',
    'placeholder.description': 'Describe the purpose of the group...',
    
    // Configuration
    'config.title': 'Configuration',
    'config.split_method': 'Split Method',
    'config.equal_split': 'Equal Split',
    'config.start_date': 'Start Date',
    'config.end_date': 'End Date (optional)',
    'config.date_format': 'dd/mm/yyyy',
    
    // Categories
    'category.general': 'General',
    'category.travel': 'Travel',
    'category.food': 'Food',
    'category.entertainment': 'Entertainment',
    'category.services': 'Services',
    'category.other': 'Other',
    
    // Instructions (to be removed)
    'instructions.auto_include': 'You are automatically included as a participant',
    'instructions.add_addresses': 'Add your friends\' wallet addresses',
    'instructions.min_participants': 'Minimum 2 participants to create the group',
    
    // Language
    'language.spanish': 'Español',
    'language.english': 'English',
    'language.select': 'Language'
  }
}

// ===========================================
// Context
// ===========================================

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// ===========================================
// Provider
// ===========================================

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('splitpay-language') as Language
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('splitpay-language', lang)
  }

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  const translateNotification = (key: string, params: Record<string, string | number> = {}): string => {
    let message = t(key)
    Object.entries(params).forEach(([param, value]) => {
      message = message.replace(`{${param}}`, String(value))
    })
    return message
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    translateNotification
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// ===========================================
// Hook
// ===========================================

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
