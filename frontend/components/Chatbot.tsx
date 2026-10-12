'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

const QUICK_QUESTIONS = [
  'NIS дайындығы қалай жүргізіледі?',
  'Курстар бағасы қанша?',
  'Тегін сынақ сабақ бар ма?',
  'Сертификат береміз бе?'
]

const BOT_RESPONSES: Record<string, string> = {
  'NIS дайындығы қалай жүргізіледі?': 'NIS дайындығы кешенді бағдарлама бойынша жүргізіледі. Математика, физика және логика пәндері бойынша терең дайындық. Апта сайын онлайн сабақтар және үй тапсырмалары. Жеке куратор тағайындалады.',
  'Курстар бағасы қанша?': 'Біздің курстар 25,000 теңгеден басталады. Базалық, Стандарт және Premium тарифтер бар. Kaspi 0-0-12 бөліп төлеу мүмкіндігі қолжетімді. Тегін сынақ сабаққа тіркеліп, толық ақпарат алыңыз!',
  'Тегін сынақ сабақ бар ма?': 'Иә, біз барлық жаңа студенттерге тегін сынақ сабақ ұсынамыз! Сіз таңдаған пән бойынша 1 сағаттық толық сабаққа қатыса аласыз. "Тегін сынақ сабақ" батырмасын басып тіркеліңіз.',
  'Сертификат береміз бе?': 'Иә, курсты сәтті аяқтағандарға электронды сертификат беріледі. Сертификат Білім министрлігі талаптарына сәйкес ресімделеді және LinkedIn-ге қосуға болады.'
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Сәлеметсіз бе! Мен Zerdeli виртуалды көмекші ботымын. Сізге қалай көмектесе аламын?',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')

  const handleSend = () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: BOT_RESPONSES[inputText] || 'Рахмет сұрағыңыз үшін! Біздің оператор жақын арада сізбен байланысады. WhatsApp: +7 (701) 234-56-78',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  const handleQuickQuestion = (question: string) => {
    setInputText(question)
    setTimeout(() => handleSend(), 100)
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 text-white shadow-2xl hover:shadow-zerdeli-500/50 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[32rem] bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">Zerdeli Көмекші</h3>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Онлайн</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-bgSecondary">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-slate-900 dark:text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      message.type === 'user'
                        ? 'bg-zerdeli-500 text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text border border-gray-200 dark:border-dark-border'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-900 dark:text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 dark:text-dark-textSecondary">
                  <Sparkles className="w-4 h-4 text-zerdeli-500" />
                  <span>Жиі қойылатын сұрақтар:</span>
                </div>
                <div className="space-y-2">
                  {QUICK_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-bgTertiary hover:bg-zerdeli-50 dark:hover:bg-zerdeli-950 text-gray-700 dark:text-dark-text hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors border border-gray-200 dark:border-dark-border"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Сұрағыңызды жазыңыз..."
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bgTertiary text-gray-900 dark:text-dark-text placeholder:text-gray-400 dark:placeholder:text-dark-textTertiary focus:outline-none focus:ring-2 focus:ring-zerdeli-500 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
