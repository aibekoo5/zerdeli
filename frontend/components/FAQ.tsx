'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQ_ITEMS = [
  {
    question: 'Zerdeli платформасы қалай жұмыс істейді?',
    answer: 'Zerdeli - бұл онлайн білім беру платформасы. Сіз тіркелесіз, қажетті курсты таңдайсыз, тарифті сатып аласыз және бейне сабақтар, тестілер мен тапсырмаларға қол жеткізесіз. Барлық материалдар 24/7 қолжетімді.'
  },
  {
    question: 'Курстардың бағасы қанша?',
    answer: 'Біздің 3 негізгі тарифіміз бар: Базалық (19,990₸/ай), Стандарт (29,990₸/ай) және Премиум (49,990₸/ай). Әр тариф түрлі мүмкіндіктерді қамтиды. Жылдық жазылым үшін 20% жеңілдік беріледі.'
  },
  {
    question: 'Мұғалімдер кім? Олардың тәжірибесі қандай?',
    answer: 'Біздің команда - бұл PhD дәрежесі бар ғалымдар, NIS/BIL мұғалімдері және олимпиада жаттықтырушылары. Орташа тәжірибе - 10+ жыл. Барлық мұғалімдер халықаралық сертификаттарға ие.'
  },
  {
    question: 'ҰБТ-ға дайындық қанша уақытты алады?',
    answer: 'Орташа дайындық мерзімі 6-12 ай. Базалық білім деңгейіңізге байланысты. Біз жеке оқу жоспарын жасаймыз және үлгерімді үнемі бақылаймыз.'
  },
  {
    question: 'Тегін сынақ кезең бар ма?',
    answer: 'Иә! Барлық жаңа студенттерге 7 күндік тегін сынақ кезең беріледі. Бұл уақытта барлық курстарды, тестілерді және материалдарды қарай аласыз.'
  },
  {
    question: 'Грантқа түсу кепілдігі бар ма?',
    answer: 'Біз дайындықтың сапасына кепілдік береміз. 95% студенттеріміз грантқа түседі. Алайда, нәтиже сіздің еңбегіңізге де байланысты. Біз барлық қажетті білім мен дағдыларды береміз.'
  },
  {
    question: 'Онлайн сабақтар қалай өтеді?',
    answer: 'Сабақтар екі форматта: жазылған бейне сабақтар (кез келген уақытта қарауға болады) және тікелей эфирлер (аптасына 2-3 рет). Барлық материалдар платформада сақталады.'
  },
  {
    question: 'Қосымша көмек алуға бола ма?',
    answer: 'Әрине! Премиум тарифте жеке кураторлық қызмет бар. Сондай-ақ барлық студенттер чат арқылы сұрақтарын қоя алады, мұғалімдер 24 сағат ішінде жауап береді.'
  },
  {
    question: 'Курсты аяқтағаннан кейін сертификат беріле ме?',
    answer: 'Иә, курсты сәтті аяқтағаннан кейін және барлық тестілерді тапсырғаннан кейін сіз электронды сертификат аласыз. Сертификат қолданылу мерзімі шексіз.'
  },
  {
    question: 'Ақшамды қайтаруға бола ма?',
    answer: 'Иә, бірінші 14 күн ішінде егер платформа сізге қанағаттанарлық болмаса, толық ақшаңызды қайтарамыз. Ешқандай сұрақсыз.'
  }
]

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-white dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-zerdeli-100 dark:bg-zerdeli-950 border border-zerdeli-200 dark:border-zerdeli-800"
          >
            <HelpCircle className="w-4 h-4 text-zerdeli-600 dark:text-zerdeli-400" />
            <span className="text-sm font-semibold text-zerdeli-700 dark:text-zerdeli-300">
              Жиі қойылатын сұрақтар
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-dark-text mb-4"
          >
            Сұрақтарыңызға <span className="text-gradient-zerdeli">жауап</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-dark-textSecondary"
          >
            Ең көп қойылатын сұрақтарға жауаптар
          </motion.p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <span className="font-semibold text-gray-900 dark:text-dark-text group-hover:text-zerdeli-600 dark:group-hover:text-zerdeli-400 transition-colors pr-4">
                  {item.question}
                </span>
                <div className="shrink-0 w-8 h-8 rounded-lg bg-zerdeli-100 dark:bg-zerdeli-950 flex items-center justify-center text-zerdeli-600 dark:text-zerdeli-400 group-hover:bg-zerdeli-200 dark:group-hover:bg-zerdeli-900 transition-colors">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0">
                      <div className="pl-0 border-l-4 border-zerdeli-500 pl-4 py-2">
                        <p className="text-gray-600 dark:text-dark-textSecondary leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-br from-zerdeli-50 to-emerald-50 dark:from-zerdeli-950/30 dark:to-emerald-950/30 border border-zerdeli-200 dark:border-zerdeli-800"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Әлі де сұрағыңыз бар ма?
          </h3>
          <p className="text-gray-600 dark:text-dark-textSecondary mb-4">
            Біздің команда сізге көмектесуге әрқашан дайын
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+77012345678"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-zerdeli-500 hover:bg-zerdeli-600 text-white font-semibold transition-colors"
            >
              📞 Қоңырау шалу
            </a>
            <a
              href="mailto:info@zerdeli.kz"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-zerdeli-500 dark:hover:border-zerdeli-500 text-gray-900 dark:text-dark-text font-semibold transition-colors"
            >
              ✉️ Email жазу
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
