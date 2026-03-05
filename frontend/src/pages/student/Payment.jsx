import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  LockClosedIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline'
import api from '../../services/api'

const Payment = () => {
  const [paymentHistory, setPaymentHistory] = useState([])
  const [savedMethods, setSavedMethods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)

  useEffect(() => {
    fetchData()
    // Load saved payment methods from localStorage
    const saved = localStorage.getItem('savedPaymentMethods')
    if (saved) setSavedMethods(JSON.parse(saved))
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const historyRes = await api.get('/payment/history')
      setPaymentHistory(historyRes.data.data || [])
    } catch (error) {
      console.error('Error fetching payment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA'

  // Payment Modal Component
  const PaymentModal = () => {
    const [step, setStep] = useState(1)
    const [amount, setAmount] = useState('')
    const [purpose, setPurpose] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('')
    const [saveMethod, setSaveMethod] = useState(false)
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' })
    const [paypalEmail, setPaypalEmail] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [errors, setErrors] = useState({})

    const purposes = [
      { id: 'registration', name: 'Frais d\'inscription' },
      { id: 'tuition', name: 'Frais de scolarité' },
      { id: 'exam', name: 'Frais d\'examen' },
      { id: 'library', name: 'Frais de bibliothèque' },
      { id: 'other', name: 'Autre' },
    ]

    const formatCardNumber = (value) => {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
      const parts = []
      for (let i = 0; i < v.length && i < 16; i += 4) {
        parts.push(v.substring(i, i + 4))
      }
      return parts.join(' ')
    }

    const formatExpiry = (value) => {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
      if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4)
      return v
    }

    const validateForm = () => {
      const newErrors = {}
      if (!amount || parseInt(amount) < 1000) newErrors.amount = 'Montant minimum: 1,000 FCFA'
      if (!purpose) newErrors.purpose = 'Sélectionnez l\'objet du paiement'
      if (!paymentMethod) newErrors.method = 'Sélectionnez un mode de paiement'

      if (paymentMethod === 'card') {
        if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16)
          newErrors.cardNumber = 'Numéro de carte invalide'
        if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry))
          newErrors.expiry = 'Date invalide (MM/AA)'
        if (!cardDetails.cvv || cardDetails.cvv.length < 3)
          newErrors.cvv = 'CVV invalide'
        if (!cardDetails.name) newErrors.name = 'Nom requis'
      }

      if (paymentMethod === 'paypal') {
        if (!paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail))
          newErrors.paypalEmail = 'Email invalide'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSaveMethod = () => {
      if (saveMethod && paymentMethod === 'card' && cardDetails.number) {
        const maskedCard = {
          id: Date.now(),
          type: 'card',
          last4: cardDetails.number.replace(/\s/g, '').slice(-4),
          name: cardDetails.name,
          expiry: cardDetails.expiry,
        }
        const updated = [...savedMethods.filter(m => m.last4 !== maskedCard.last4), maskedCard]
        setSavedMethods(updated)
        localStorage.setItem('savedPaymentMethods', JSON.stringify(updated))
      }
    }

    const processPayment = async () => {
      if (!validateForm()) return

      setIsProcessing(true)
      try {
        const payload = {
          amount: parseInt(amount),
          payment_method: paymentMethod,
          purpose,
        }

        const response = await api.post('/payment/initialize', payload)

        handleSaveMethod()

        const paymentData = response.data.payment_data

        // If the provider returned a redirect URL, navigate there
        if (paymentData?.type === 'redirect' && paymentData?.url) {
          window.location.href = paymentData.url
          return
        }

        // Payment was confirmed by the backend (internal or auto-confirmed)
        setPaymentStatus({
          status: response.data.status === 'completed' ? 'success' : 'pending',
          reference: response.data.reference,
          amount: parseInt(amount),
          purpose: purposes.find(p => p.id === purpose)?.name,
        })
        setStep(3)

        if (response.data.status === 'completed') {
          fetchData()
          toast.success('Paiement effectué avec succès!')
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Erreur lors du paiement')
        setPaymentStatus({ status: 'failed' })
        setStep(3)
      } finally {
        setIsProcessing(false)
      }
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-200 rounded-xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-green-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Paiement sécurisé</h2>
            </div>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Step 1: Amount & Purpose */}
          {step === 1 && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Objet du paiement
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${errors.purpose ? 'border-red-500' : 'border-gray-200 dark:border-dark-100'} bg-white dark:bg-dark-300 text-gray-900 dark:text-white`}
                >
                  <option value="">Sélectionner...</option>
                  {purposes.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                  min="1000"
                  className={`w-full p-3 rounded-lg border ${errors.amount ? 'border-red-500' : 'border-gray-200 dark:border-dark-100'} bg-white dark:bg-dark-300 text-gray-900 dark:text-white`}
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (amount && parseInt(amount) >= 1000 && purpose) setStep(2)
                    else validateForm()
                  }}
                  className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-gray-200 dark:border-dark-100">
                <p className="text-sm text-gray-500">Montant à payer</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(parseInt(amount))}</p>
                <p className="text-sm text-gray-500">{purposes.find(p => p.id === purpose)?.name}</p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode de paiement</p>
                
                {/* Saved Methods */}
                {savedMethods.length > 0 && (
                  <div className="space-y-2 pb-3 border-b border-gray-200 dark:border-dark-100">
                    <p className="text-xs text-gray-500">Méthodes enregistrées</p>
                    {savedMethods.map(method => (
                      <button
                        key={method.id}
                        onClick={() => {
                          setPaymentMethod('card')
                          setCardDetails({ ...cardDetails, name: method.name })
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                          paymentMethod === 'saved-' + method.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-dark-100 hover:border-gray-300'
                        }`}
                      >
                        <CreditCardIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">•••• {method.last4}</span>
                        <span className="text-xs text-gray-500 ml-auto">{method.expiry}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-100 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <CreditCardIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Carte bancaire</p>
                    <p className="text-xs text-gray-500">Visa, Mastercard</p>
                  </div>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'paypal'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-100 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#003087] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PP</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">PayPal</p>
                    <p className="text-xs text-gray-500">Paiement sécurisé</p>
                  </div>
                </button>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-dark-100">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Numéro de carte</label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full p-2.5 rounded-lg border ${errors.cardNumber ? 'border-red-500' : 'border-gray-200 dark:border-dark-100'} bg-white dark:bg-dark-300 text-gray-900 dark:text-white text-sm`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Expiration</label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                        placeholder="MM/AA"
                        className={`w-full p-2.5 rounded-lg border ${errors.expiry ? 'border-red-500' : 'border-gray-200 dark:border-dark-100'} bg-white dark:bg-dark-300 text-gray-900 dark:text-white text-sm`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        maxLength={4}
                        placeholder="123"
                        className={`w-full p-2.5 rounded-lg border ${errors.cvv ? 'border-red-500' : 'border-gray-200 dark:border-dark-100'} bg-white dark:bg-dark-300 text-gray-900 dark:text-white text-sm`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nom sur la carte</label>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                      placeholder="JOHN DOE"
                      className={`w-full p-2.5 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-dark-100'} bg-white dark:bg-dark-300 text-gray-900 dark:text-white text-sm`}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveMethod}
                      onChange={(e) => setSaveMethod(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Enregistrer pour les prochains paiements
                    </span>
                  </label>
                </div>
              )}

              {/* PayPal Email */}
              {paymentMethod === 'paypal' && (
                <div className="pt-4 border-t border-gray-200 dark:border-dark-100">
                  <label className="block text-xs text-gray-500 mb-1">Email PayPal</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className={`w-full p-2.5 rounded-lg border ${errors.paypalEmail ? 'border-red-500' : 'border-gray-200 dark:border-dark-100'} bg-white dark:bg-dark-300 text-gray-900 dark:text-white text-sm`}
                  />
                  <p className="text-xs text-gray-500 mt-2">Vous serez redirigé vers PayPal pour confirmer</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                >
                  Retour
                </button>
                <button
                  onClick={processPayment}
                  disabled={!paymentMethod || isProcessing}
                  className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LockClosedIcon className="w-4 h-4" />
                      Payer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 3 && (
            <div className="p-6 text-center">
              {paymentStatus?.status === 'pending' && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <ClockIcon className="w-8 h-8 text-yellow-500 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Traitement en cours...
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">Veuillez patienter</p>
                  <p className="text-xs text-gray-400">Réf: {paymentStatus.reference}</p>
                </>
              )}

              {paymentStatus?.status === 'success' && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                  >
                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Paiement réussi!
                  </h3>
                  <p className="text-gray-500 text-sm mb-1">{formatCurrency(paymentStatus.amount)}</p>
                  <p className="text-gray-400 text-xs mb-4">{paymentStatus.purpose}</p>
                  <p className="text-xs text-gray-400 mb-4">Réf: {paymentStatus.reference}</p>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium"
                  >
                    Fermer
                  </button>
                </>
              )}

              {paymentStatus?.status === 'failed' && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircleIcon className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Échec du paiement
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">Une erreur s'est produite</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-2.5 border border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 rounded-lg"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => { setStep(2); setPaymentStatus(null) }}
                      className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg font-medium"
                    >
                      Réessayer
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="h-12 bg-gray-100 dark:bg-dark-200 rounded-lg animate-pulse w-1/2" />
        <div className="h-40 bg-gray-100 dark:bg-dark-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-dark-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Paiement</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Effectuez vos paiements en toute sécurité
        </p>
      </motion.div>

      {/* Payment Action Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-200 rounded-lg border border-gray-200 dark:border-dark-100 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Nouveau paiement</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Carte bancaire ou PayPal acceptés
            </p>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <CreditCardIcon className="w-5 h-5" />
            Payer
          </button>
        </div>

        {/* Payment Methods Icons */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-dark-100">
          <span className="text-xs text-gray-500">Méthodes acceptées:</span>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-gray-100 dark:bg-dark-300 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
              VISA
            </div>
            <div className="px-3 py-1.5 bg-gray-100 dark:bg-dark-300 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
              Mastercard
            </div>
            <div className="px-3 py-1.5 bg-[#003087] rounded text-xs font-bold text-white">
              PayPal
            </div>
          </div>
        </div>
      </motion.div>

      {/* Saved Payment Methods */}
      {savedMethods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-200 rounded-lg border border-gray-200 dark:border-dark-100 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookmarkIcon className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Méthodes enregistrées</h2>
          </div>
          <div className="space-y-3">
            {savedMethods.map(method => (
              <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-300 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCardIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">•••• •••• •••• {method.last4}</p>
                    <p className="text-xs text-gray-500">{method.name} • Exp. {method.expiry}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = savedMethods.filter(m => m.id !== method.id)
                    setSavedMethods(updated)
                    localStorage.setItem('savedPaymentMethods', JSON.stringify(updated))
                  }}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-dark-200 rounded-lg border border-gray-200 dark:border-dark-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-100">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Historique des paiements</h2>
        </div>

        {paymentHistory.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCardIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Aucun paiement effectué</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-dark-100">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    payment.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : payment.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {payment.status === 'completed' ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    ) : payment.status === 'pending' ? (
                      <ClockIcon className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.payment_date || payment.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {' • '}{payment.reference}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && <PaymentModal />}
      </AnimatePresence>
    </div>
  )
}

export default Payment
