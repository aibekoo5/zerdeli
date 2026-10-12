'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  GraduationCap,
  Award,
  Star,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Medal
} from 'lucide-react'

const TEACHERS = [
  {
    id: 1,
    name: 'Асет Нұрғалиев',
    avatar: '👨‍🏫',
    subject: 'Математика',
    level: 'Эксперт',
    experience: 15,
    students: 2500,
    rating: 4.9,
    reviews: 450,
    achievements: ['NIS дайындық', 'ҰБТ 40/40', 'Олимпиада жаттықтырушысы'],
    bio: 'Математика пәнінің маманы. 15 жылдық тәжірибе. 100+ студент NIS, BIL-ге түсті.',
    university: 'ҚазҰУ математика факультеті',
    color: 'blue'
  },
  {
    id: 2,
    name: 'Гүлнар Смағұлова',
    avatar: '👩‍🏫',
    subject: 'Физика',
    level: 'Магистр',
    experience: 12,
    students: 1800,
    rating: 4.8,
    reviews: 320,
    achievements: ['RFMSH дайындық', 'Халықаралық олимпиада', 'Ғылыми жоба жетекшісі'],
    bio: 'Физика пәнінің тәжірибелі мұғалімі. Студенттер олимпиадаларда жүлделі орындарға ие болады.',
    university: 'ҚазҰУ физика факультеті',
    color: 'purple'
  },
  {
    id: 3,
    name: 'Ержан Қайратұлы',
    avatar: '👨‍💼',
    subject: 'Қазақ тілі',
    level: 'PhD',
    experience: 20,
    students: 3200,
    rating: 5.0,
    reviews: 580,
    achievements: ['ҰБТ 25/25 кепілдігі', 'Тіл білімі маманы', 'Оқулық авторы'],
    bio: 'Қазақ тілі мен әдебиеті бойынша PhD. Авторлық әдістеме. 95% студент максимал балл алады.',
    university: 'Абай атындағы ҚазҰПУ',
    color: 'emerald'
  },
  {
    id: 4,
    name: 'Айгерім Бекболатова',
    avatar: '👩‍🔬',
    subject: 'Химия',
    level: 'Кандидат',
    experience: 10,
    students: 1500,
    rating: 4.9,
    reviews: 280,
    achievements: ['Медициналық дайындық', 'Лабораториялық практикум', 'ҰБТ 23/25'],
    bio: 'Химия ғылымдарының кандидаты. Медбио бағытына дайындық. Практикалық тәсіл.',
    university: 'ҚазҰМУ',
    color: 'orange'
  },
  {
    id: 5,
    name: 'Дәурен Мұхамеджанов',
    avatar: '👨‍💻',
    subject: 'Информатика',
    level: 'Senior Developer',
    experience: 8,
    students: 2100,
    rating: 4.8,
    reviews: 390,
    achievements: ['IT мектеп дайындығы', 'Программалау олимпиадасы', 'Startup кеңесшісі'],
    bio: 'IT индустриясында 8 жыл. Программалау және алгоритмдер бойынша маман.',
    university: 'КБТУ Computer Science',
    color: 'indigo'
  },
  {
    id: 6,
    name: 'Сауле Ибрагимова',
    avatar: '👩‍🎓',
    subject: 'Ағылшын тілі',
    level: 'CELTA',
    experience: 14,
    students: 2800,
    rating: 4.9,
    reviews: 520,
    achievements: ['IELTS 8.5', 'CELTA сертификаты', 'Кембридж емтихандары'],
    bio: 'Ағылшын тілі мұғалімі. IELTS, TOEFL дайындық. 90% студент 7.0+ балл алады.',
    university: 'Cambridge CELTA',
    color: 'red'
  },
  {
    id: 7,
    name: 'Нұрлан Аманов',
    avatar: '👨‍🏫',
    subject: 'Биология',
    level: 'Магистр',
    experience: 11,
    students: 1600,
    rating: 4.7,
    reviews: 310,
    achievements: ['Медбио дайындық', 'Анатомия және физиология', 'ҰБТ 24/25'],
    bio: 'Биология пәнінің маманы. Медициналық университеттерге дайындық бойынша эксперт.',
    university: 'ҚазҰМУ биология факультеті',
    color: 'green'
  },
  {
    id: 8,
    name: 'Жанар Сейітова',
    avatar: '👩‍💼',
    subject: 'Дүниежүзі тарихы',
    level: 'Кандидат',
    experience: 16,
    students: 1900,
    rating: 4.8,
    reviews: 340,
    achievements: ['Әлемдік тарих маманы', 'Олимпиада дайындығы', 'Автор курстар'],
    bio: 'Тарих ғылымдарының кандидаты. Әлемдік және Қазақстан тарихы бойынша эксперт.',
    university: 'ЕҰУ тарих факультеті',
    color: 'amber'
  },
  {
    id: 9,
    name: 'Алмас Төлегенов',
    avatar: '👨‍🔬',
    subject: 'География',
    level: 'Магистр',
    experience: 9,
    students: 1200,
    rating: 4.7,
    reviews: 220,
    achievements: ['Картография', 'Қоршаған орта', 'Топография'],
    bio: 'География пәнінің маманы. Практикалық тәсіл және заманауи технологиялар.',
    university: 'ҚазҰУ география факультеті',
    color: 'cyan'
  }
]

const SUBJECTS = ['Барлығы', 'Математика', 'Физика', 'Қазақ тілі', 'Химия', 'Информатика', 'Ағылшын тілі', 'Биология', 'Дүниежүзі тарихы', 'География']

export default function TeachersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState('Барлығы')

  const filteredTeachers = TEACHERS.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterSubject === 'Барлығы' || teacher.subject === filterSubject

    return matchesSearch && matchesFilter
  })

  return (
    <main className="min-h-screen bg-white dark:bg-dark-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-zerdeli-50 via-emerald-50 to-white dark:from-dark-bgSecondary dark:via-dark-bgTertiary dark:to-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="success" className="mb-4">
              Біздің команда
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-dark-text mb-4">
              Тәжірибелі <span className="text-gradient-zerdeli">Мұғалімдер</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-dark-textSecondary">
              Озат педагогтар, PhD дәрежелі ғалымдар және индустрия мамандары
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 text-center border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="text-3xl font-black text-zerdeli-500 mb-2">100+</div>
              <div className="text-sm text-gray-600 dark:text-dark-textSecondary">Мұғалім</div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 text-center border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="text-3xl font-black text-amber-500 mb-2">15+</div>
              <div className="text-sm text-gray-600 dark:text-dark-textSecondary">Жыл тәжірибе</div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 text-center border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="text-3xl font-black text-blue-500 mb-2">4.9</div>
              <div className="text-sm text-gray-600 dark:text-dark-textSecondary">Орташа баға</div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 text-center border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="text-3xl font-black text-purple-500 mb-2">20K+</div>
              <div className="text-sm text-gray-600 dark:text-dark-textSecondary">Студент оқытты</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Мұғалім іздеу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-zerdeli-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {SUBJECTS.map(subject => (
                  <button
                    key={subject}
                    onClick={() => setFilterSubject(subject)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      filterSubject === subject
                        ? 'bg-zerdeli-500 text-slate-900 dark:text-white'
                        : 'bg-gray-100 dark:bg-dark-bgTertiary text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-cardHover'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map(teacher => (
              <Card key={teacher.id} hover className="group">
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{teacher.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-dark-text group-hover:text-zerdeli-600 dark:group-hover:text-zerdeli-400 transition-colors">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-textTertiary">{teacher.university}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="default">{teacher.subject}</Badge>
                        <Badge variant="info">{teacher.level}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 dark:text-dark-textSecondary line-clamp-2">
                    {teacher.bio}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-4 py-3 border-y border-gray-200 dark:border-dark-border">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-gray-900 dark:text-dark-text">{teacher.rating}</span>
                      <span className="text-sm text-gray-500 dark:text-dark-textTertiary">({teacher.reviews})</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-zerdeli-500" />
                      <span className="text-gray-700 dark:text-dark-textSecondary">{teacher.students}+ студент</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-gray-700 dark:text-dark-textSecondary">{teacher.experience} жыл</span>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700 dark:text-dark-textSecondary flex items-center gap-1">
                      <Medal className="w-4 h-4 text-zerdeli-500" />
                      <span>Жетістіктер:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.achievements.map((achievement, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-md bg-zerdeli-50 dark:bg-zerdeli-950 text-zerdeli-700 dark:text-zerdeli-300 border border-zerdeli-200 dark:border-zerdeli-800"
                        >
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
                Мұғалім табылмады
              </h3>
              <p className="text-gray-600 dark:text-dark-textSecondary">
                Басқа іздеу сөзін немесе фильтрді қолданып көріңіз
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Our Teachers */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-zerdeli-50/30 dark:from-dark-bgSecondary dark:to-dark-bgTertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-dark-text mb-4">
              Неліктен біздің <span className="text-gradient-zerdeli">мұғалімдер?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-zerdeli-500/10 dark:bg-zerdeli-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-zerdeli-500" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-dark-text mb-2">Сертификатталған мамандар</h3>
              <p className="text-sm text-gray-600 dark:text-dark-textSecondary">
                Барлық мұғалімдер халықаралық және ұлттық сертификаттарға ие
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-dark-text mb-2">Дәлелденген нәтижелер</h3>
              <p className="text-sm text-gray-600 dark:text-dark-textSecondary">
                95% студенттер грант алып, арман университеттеріне түседі
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-dark-text mb-2">Жеке тәсіл</h3>
              <p className="text-sm text-gray-600 dark:text-dark-textSecondary">
                Әр студентке жеке бағдарлама және максимал назар
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
