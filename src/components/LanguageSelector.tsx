import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { Globe } from 'lucide-react'

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage()

  const handleLanguageChange = (newLanguage: 'es' | 'en') => {
    setLanguage(newLanguage)
  }

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value as 'es' | 'en')}
        className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="es">{t('language.spanish')}</option>
        <option value="en">{t('language.english')}</option>
      </select>
    </div>
  )
}

export default LanguageSelector
