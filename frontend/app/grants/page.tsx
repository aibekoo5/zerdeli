'use client'

import React from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Award,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Target,
  Sparkles
} from 'lucide-react'

const GRANT_INFO = [
  {
    title: 'Мемлекеттік білім беру гранты',
    description: 'ҰБТ балы бойынша берілетін негізгі грант түрі',
    minScore: 50,
    benefits: [
      'Толық тегін оқу',
      'Жатақхана орны (қалалық студенттерге)',
      'Стипендия мүмкіндігі',
      'Кітапхана қызметтері'
    ],
    color: 'emerald',
    icon: Award
  },
  {
    title: 'Президент гранты "Болашақ"',
    description: 'Озық студенттер үшін арнайы грант',
    minScore: 130,
    benefits: [
      'Толық оқу төлемі',
      'Қосымша стипендия',
      'Шетелде оқу мүмкіндігі',
      'Кәсіби дамыту бағдарламалары'
    ],
    color: 'blue',
    icon: Sparkles
  },
  {
    title: 'Әлеуметтік грант',
    description: 'Әлеуметтік көмекке мұқтаж отбасылардан шыққан студенттерге',
    minScore: 50,
    benefits: [
      'Толық оқу төлемі',
      'Материалдық көмек',
      'Жатақхана жеңілдігі',
      'Тамақтану жеңілдігі'
    ],
    color: 'purple',
    icon: Users
  },
  {
    title: 'Жергілікті әкімдік гранты',
    description: 'Өңірлік бюджеттен берілетін гранттар',
    minScore: 50,
    benefits: [
      'Өңірлік ЖОО-ларда оқу',
      'Қосымша материалдық көмек',
      'Мандатты орналастыру',
      'Жұмысқа орналасу кепілдігі'
    ],
    color: 'amber',
    icon: Target
  }
]

const SCORE_REQUIREMENTS = [
  {
    score: '140',
    description: 'Кез келген ЖОО-ға және мамандыққа 100% грант кепілдігі',
    universities: ['NU', 'SDU', 'КБТУ', 'ҚазҰМУ'],
    color: 'text-amber-500'
  },
  {
    score: '130-139',
    description: 'Беделді университеттердің барлық мамандықтарына грант',
    universities: ['ҚазҰУ', 'Satbayev', 'ҚазҰМУ', 'ЕҰУ'],
    color: 'text-emerald-500'
  },
  {
    score: '120-129',
    description: 'Көптеген мамандықтарға грант мүмкіндігі',
    universities: ['ҚазҰПУ', 'ҚазҰТУ', 'Өңірлік ЖОО-лар'],
    color: 'text-blue-500'
  },
  {
    score: '100-119',
    description: 'Белгілі бір мамандықтар мен ЖОО-ларға грант',
    universities: ['Өңірлік университеттер', 'Арнайы мамандықтар'],
    color: 'text-purple-500'
  }
]

const TIMELINE = [
  {
    month: 'Маусым',
    event: 'ҰБТ өткізу',
    description: 'Негізгі емтихан кезеңі'
  },
  {
    month: 'Шілде',
    event: 'Нәтижелер жариялануы',
    description: 'ҰБТ баллдарының шығуы'
  },
  {
    month: 'Тамыз',
    event: 'Өтініш беру',
    description: 'ЖОО-ға құжат тапсыру'
  },
  {
    month: 'Қыркүйек',
    event: 'Оқуды бастау',
    description: 'Академиялық жылдың басталуы'
  }
]

export default function GrantsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-zerdeli-50 via-emerald-50 to-white dark:from-dark-bgSecondary dark:via-dark-bgTertiary dark:to-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="success" className="mb-4">
              2024-2025 оқу жылы
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-dark-text mb-4">
              Мемлекеттік <span className="text-gradient-zerdeli">Білім Беру Гранты</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-dark-textSecondary">
              Грант алу шарттары, талаптар және толық ақпарат
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 text-center border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="text-3xl font-black text-zerdeli-500 mb-2">60,000+</div>
              <div className="text-sm text-gray-600 dark:text-dark-textSecondary">Грант орындары</div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 text-center border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="text-3xl font-black text-amber-500 mb-2">140</div>
              <div className="text-sm text-gray-600 dark:text-dark-textSecondary">Максимал балл</div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 text-center border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="text-3xl font-black text-blue-500 mb-2">50+</div>
              <div className="text-sm text-gray-600 dark:text-dark-textSecondary">Грант беретін ЖОО</div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 text-center border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="text-3xl font-black text-purple-500 mb-2">100%</div>
              <div className="text-sm text-gray-600 dark:text-dark-textSecondary">Тегін оқу</div>
            </div>
          </div>
        </div>
      </section>

      {/* Grant Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-dark-text mb-4">
              Грант түрлері
            </h2>
            <p className="text-gray-600 dark:text-dark-textSecondary">
              Әртүрлі категориядағы студенттер үшін грант мүмкіндіктері
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GRANT_INFO.map((grant, index) => {
              const Icon = grant.icon
              return (
                <Card key={index} hover className="group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-${grant.color}-500/10 dark:bg-${grant.color}-500/20 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${grant.color}-500`} />
                      </div>
                      <Badge variant="info">ҰБТ: {grant.minScore}+</Badge>
                    </div>
                    <CardTitle>{grant.title}</CardTitle>
                    <CardDescription>{grant.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {grant.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-zerdeli-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 dark:text-dark-textSecondary">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Score Requirements */}
      <section className="py-16 bg-gray-50 dark:bg-dark-bgSecondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-dark-text mb-4">
              Балл бойынша грант мүмкіндіктері
            </h2>
            <p className="text-gray-600 dark:text-dark-textSecondary">
              Әр балл диапазоны үшін қол жетімді университеттер
            </p>
          </div>

          <div className="space-y-4">
            {SCORE_REQUIREMENTS.map((req, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl font-black ${req.color} shrink-0`}>
                    {req.score}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-2">
                      {req.description}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {req.universities.map((uni, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-sm rounded-lg bg-zerdeli-50 dark:bg-zerdeli-950 text-zerdeli-700 dark:text-zerdeli-300 border border-zerdeli-200 dark:border-zerdeli-800"
                        >
                          {uni}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-dark-text mb-4">
              Грант алу кестесі
            </h2>
            <p className="text-gray-600 dark:text-dark-textSecondary">
              ҰБТ-дан грантқа түсу дейінгі негізгі кезеңдер
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {TIMELINE.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-zerdeli-500 text-white flex items-center justify-center mx-auto mb-4 font-bold">
                    {index + 1}
                  </div>
                  <div className="text-sm font-semibold text-zerdeli-600 dark:text-zerdeli-400 mb-2">
                    {item.month}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-dark-text mb-2">
                    {item.event}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-textSecondary">
                    {item.description}
                  </p>
                </div>
                {index < TIMELINE.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-zerdeli-500 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Info */}
      <section className="py-16 bg-amber-50 dark:bg-amber-950/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-dark-card rounded-2xl p-8 border border-amber-200 dark:border-amber-800/30 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-4">
                  Маңызды ақпарат
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-zerdeli-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-dark-textSecondary">
                      Грант алу үшін ҰБТ-да минимум 50 балл жинау қажет
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-zerdeli-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-dark-textSecondary">
                      Грант бәсекелік негізде, балл бойынша беріледі
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-zerdeli-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-dark-textSecondary">
                      Әр мамандық пен ЖОО үшін грант өткел баллы әртүрлі
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-zerdeli-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-dark-textSecondary">
                      Өтініш беру кезінде құжаттардың толықтығын тексеріңіз
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
