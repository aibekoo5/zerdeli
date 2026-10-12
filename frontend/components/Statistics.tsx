'use client'

import React from 'react'
import {
  Users,
  Award,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Target,
  Star,
  CheckCircle2
} from 'lucide-react'
import { motion } from 'framer-motion'

const STATS = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Белсенді студент',
    color: 'text-zerdeli-500',
    bgColor: 'bg-zerdeli-500/10 dark:bg-zerdeli-500/20'
  },
  {
    icon: GraduationCap,
    value: '95%',
    label: 'Грантқа түскен студент',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20'
  },
  {
    icon: BookOpen,
    value: '200+',
    label: 'Курс пен сабақ',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20'
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Орташа баға',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20'
  }
]

const SUCCESS_STORIES = [
  {
    name: 'Айдос Б.',
    university: 'Назарбаев Университеті',
    score: 140,
    text: 'Zerdeli арқылы ҰБТ-ға дайындалып, арман университетіме грантпен түстім!',
    avatar: '👨‍🎓'
  },
  {
    name: 'Айгерім М.',
    university: 'Қазақ Ұлттық Университеті',
    score: 135,
    text: 'Математикадан 40/40 балл алдым. Мұғалімдер өте жақсы түсіндіреді!',
    avatar: '👩‍🎓'
  },
  {
    name: 'Нұрлан К.',
    university: 'КБТУ',
    score: 138,
    text: 'Платформадағы тестілер нақты емтиханға өте ұқсас болды.',
    avatar: '👨‍💻'
  }
]

export const Statistics: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-zerdeli-50/30 to-white dark:from-dark-bgSecondary dark:via-dark-bgTertiary dark:to-dark-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-zerdeli-500/5 dark:bg-zerdeli-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Stats Grid */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-4 py-2 rounded-full bg-zerdeli-100 dark:bg-zerdeli-950 border border-zerdeli-200 dark:border-zerdeli-800"
          >
            <span className="text-sm font-semibold text-zerdeli-700 dark:text-zerdeli-300">
              📊 Біздің нәтижелер
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-dark-text mb-4"
          >
            Сандармен <span className="text-gradient-zerdeli">сөйлейік</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-dark-textSecondary max-w-2xl mx-auto"
          >
            Мыңдаған студент біздің платформа арқылы мақсатына жетті
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {STATS.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-dark-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-dark-textSecondary">
                  {stat.label}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Success Stories */}
        <div className="text-center mb-12">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-dark-text mb-4"
          >
            Студенттердің <span className="text-gradient-zerdeli">тәжірибесі</span>
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-dark-textSecondary"
          >
            Біздің студенттердің шынайы пікірлері
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUCCESS_STORIES.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{story.avatar}</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-dark-text">{story.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-dark-textSecondary">{story.university}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                    ҰБТ: {story.score}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-dark-textSecondary italic">
                "{story.text}"
              </p>
              <div className="mt-4 flex items-center gap-2 text-zerdeli-600 dark:text-zerdeli-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-semibold">Расталған студент</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-zerdeli-500 to-zerdeli-600 text-white shadow-xl">
            <TrendingUp className="w-12 h-12" />
            <div className="text-left">
              <h4 className="text-xl font-bold mb-1">Сен де олардың қатарында бол!</h4>
              <p className="text-zerdeli-100">Бүгіннен бастап өз нәтижеңді жақсарт</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
