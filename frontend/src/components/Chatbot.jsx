import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  UserIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getGreeting()
      addBotMessage(greeting.message, greeting.quickActions)
    }
  }, [isOpen])

  const getGreeting = () => {
    const hour = new Date().getHours()
    const timeGreeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
    
    switch (user?.role) {
      case 'admin':
        return {
          message: `${timeGreeting} ${user?.first_name}! 👋\n\nJe suis Simon, votre assistant IA. En tant qu'administrateur, vous avez accès à toutes les données du système.\n\n🔍 Recherchez un étudiant par nom ou numéro\n📊 Consultez les statistiques globales\n📈 Analysez les tendances`,
          quickActions: [
            { label: '🔍 Rechercher un étudiant', action: 'search_student' },
            { label: '📊 KPIs institutionnels', action: 'show_kpis' },
            { label: '⚠️ Alertes étudiants', action: 'show_alerts' },
          ]
        }
      case 'teacher':
        return {
          message: `${timeGreeting} ${user?.first_name}! 👋\n\nJe peux vous aider avec vos cours et vos étudiants.\n\n📚 Voir vos cours\n👥 Statistiques de vos classes\n📝 Saisir des notes`,
          quickActions: [
            { label: '📚 Mes cours', action: 'my_courses' },
            { label: '👥 Mes étudiants', action: 'my_students' },
            { label: '📅 Mon emploi du temps', action: 'my_schedule' },
          ]
        }
      case 'student':
        return {
          message: `${timeGreeting} ${user?.first_name}! 👋\n\nJe suis là pour vous aider!\n\n📊 Consultez vos notes\n💰 Vérifiez vos frais\n📅 Voyez votre emploi du temps`,
          quickActions: [
            { label: '📊 Mes notes', action: 'my_grades' },
            { label: '💰 Mes frais', action: 'my_fees' },
            { label: '📅 Mes cours', action: 'my_schedule' },
          ]
        }
      case 'finance':
        return {
          message: `${timeGreeting} ${user?.first_name}! 👋\n\nJe peux vous aider avec les finances.\n\n💰 Paiements en retard\n📊 Statistiques financières\n📈 Rapports`,
          quickActions: [
            { label: '💰 Impayés', action: 'show_unpaid' },
            { label: '📊 Stats du jour', action: 'today_stats' },
            { label: '📈 Rapport mensuel', action: 'monthly_report' },
          ]
        }
      default:
        return {
          message: `${timeGreeting}! Je suis Simon, votre assistant ESL. Comment puis-je vous aider?`,
          quickActions: []
        }
    }
  }

  const addBotMessage = (text, quickActions = null, data = null) => {
    setMessages(prev => [...prev, {
      sender: 'bot',
      text,
      quickActions,
      data,
      timestamp: new Date()
    }])
  }

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      sender: 'user',
      text,
      timestamp: new Date()
    }])
  }

  const handleSendMessage = async () => {
    if (input.trim() === '') return

    const userMessage = input.trim()
    addUserMessage(userMessage)
    setInput('')
    setIsTyping(true)
    setSearchResults(null)

    try {
      const response = await api.post('/chatbot', {
        message: userMessage,
        session_id: sessionId,
      })

      setSessionId(response.data.session_id)
      const botResponse = response.data.response

      addBotMessage(
        botResponse.message,
        botResponse.quick_actions,
        botResponse.data
      )

      if (botResponse.type === 'student_info') {
        setSearchResults(botResponse.data)
      }
    } catch (error) {
      addBotMessage(
        "Désolé, une erreur s'est produite. Veuillez réessayer.",
        null
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = async (action) => {
    let message = ''
    
    switch (action) {
      case 'search_student':
        message = 'Je veux rechercher un étudiant'
        break
      case 'show_kpis':
        message = 'Montre-moi les KPIs institutionnels'
        break
      case 'show_alerts':
        message = 'Quelles sont les alertes étudiants?'
        break
      case 'my_courses':
        message = 'Montre-moi mes cours'
        break
      case 'my_students':
        message = 'Qui sont mes étudiants?'
        break
      case 'my_schedule':
        message = 'Quel est mon emploi du temps?'
        break
      case 'my_grades':
        message = 'Quelles sont mes notes?'
        break
      case 'my_fees':
        message = 'Combien dois-je payer?'
        break
      case 'show_unpaid':
        message = 'Montre-moi les paiements en retard'
        break
      case 'today_stats':
        message = "Quelles sont les statistiques d'aujourd'hui?"
        break
      case 'monthly_report':
        message = 'Génère un rapport mensuel'
        break
      default:
        message = action
    }

    setInput(message)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addBotMessage("La reconnaissance vocale n'est pas supportée par votre navigateur.")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'from-purple-500 to-purple-600'
      case 'teacher': return 'from-blue-500 to-blue-600'
      case 'student': return 'from-primary-500 to-primary-600'
      case 'finance': return 'from-amber-500 to-amber-600'
      case 'registrar': return 'from-teal-500 to-teal-600'
      default: return 'from-primary-500 to-primary-600'
    }
  }

  const formatMessage = (text) => {
    // Convert markdown-like formatting
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.startsWith('├──') || line.startsWith('└──') ? (
          <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">{line}</span>
        ) : line.startsWith('━') ? (
          <span className="text-gray-400 dark:text-gray-500">{line}</span>
        ) : line.match(/^[📊📋📈📅💰🎓⚠️🔧✅❌🏆]/) ? (
          <span className="font-medium">{line}</span>
        ) : (
          line
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-dark-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-dark-100 z-50"
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${getRoleColor()} text-white`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Simon Assistant</h3>
                  <p className="text-xs opacity-80">IA • En ligne</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-dark-400">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.sender === 'user' ? '' : ''}`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? `bg-gradient-to-r ${getRoleColor()} text-white rounded-br-md`
                          : 'bg-white dark:bg-dark-200 text-gray-800 dark:text-white rounded-bl-md shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {formatMessage(msg.text)}
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.quickActions.map((action, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQuickAction(action.action || action)}
                            className="px-3 py-1.5 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-100 rounded-full text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors shadow-sm"
                          >
                            {action.label || action}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Student Card (for search results) */}
                    {msg.data && msg.sender === 'bot' && msg.data.registration_number && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-4 bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-100"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{msg.data.name}</h4>
                            <p className="text-xs text-gray-500">{msg.data.registration_number}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-gray-50 dark:bg-dark-300 rounded-lg">
                            <p className="text-gray-500">Moyenne</p>
                            <p className="font-bold text-primary-600">{msg.data.average}/20</p>
                          </div>
                          <div className="p-2 bg-gray-50 dark:bg-dark-300 rounded-lg">
                            <p className="text-gray-500">Présence</p>
                            <p className="font-bold text-blue-600">{msg.data.attendance_rate}%</p>
                          </div>
                          <div className="p-2 bg-gray-50 dark:bg-dark-300 rounded-lg col-span-2">
                            <p className="text-gray-500">Solde</p>
                            <p className="font-bold text-amber-600">{msg.data.remaining?.toLocaleString()} FCFA</p>
                          </div>
                        </div>

                        <button className="mt-3 w-full py-2 text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                          Voir le profil complet →
                        </button>
                      </motion.div>
                    )}

                    <p className="text-[10px] text-gray-400 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="p-3 rounded-2xl bg-white dark:bg-dark-200 rounded-bl-md shadow-sm">
                    <div className="flex items-center space-x-1">
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Admin Search Bar (Admin only) */}
            {user?.role === 'admin' && (
              <div className="px-4 py-2 border-t border-gray-100 dark:border-dark-100 bg-white dark:bg-dark-300">
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        setInput(`Cherche l'étudiant ${e.target.value}`)
                        e.target.value = ''
                        handleSendMessage()
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-dark-100 bg-white dark:bg-dark-300">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleVoiceInput}
                  className={`p-3 rounded-xl transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-100'
                  }`}
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </motion.button>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-dark-200 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className={`p-3 rounded-xl transition-colors ${
                    input.trim()
                      ? `bg-gradient-to-r ${getRoleColor()} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-dark-200 text-gray-400'
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-xl z-50 bg-gradient-to-r ${getRoleColor()} text-white`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          )}
        </motion.div>
        
        {/* Notification Badge */}
        {!isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
          >
            <SparklesIcon className="w-2.5 h-2.5 text-white" />
          </motion.span>
        )}
      </motion.button>
    </>
  )
}

export default Chatbot
