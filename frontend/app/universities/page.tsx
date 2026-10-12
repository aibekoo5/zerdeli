'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  GraduationCap,
  MapPin,
  Users,
  Award,
  TrendingUp,
  Globe,
  BookOpen,
  Star,
  Search,
  Filter
} from 'lucide-react'

const UNIVERSITIES = [
  {
    id: 1,
    name: 'Назарбаев Университеті',
    nameEn: 'Nazarbayev University',
    logo: '🎓',
    city: 'Астана',
    type: 'Зерттеу',
    rating: 5,
    students: '7000+',
    grantScore: 140,
    description: 'Қазақстандағы алғашқы зерттеу университеті, әлемдік стандарттар бойынша білім беру',
    programs: ['IT', 'Инженерия', 'Бизнес', 'Медицина'],
    tuition: 'Толық грант',
    website: 'nu.edu.kz',
    color: 'blue'
  },
  {
    id: 2,
    name: 'Қазақ Ұлттық Университеті',
    nameEn: 'Al-Farabi Kazakh National University',
    logo: '📚',
    city: 'Алматы',
    type: 'Классикалық',
    rating: 5,
    students: '20000+',
    grantScore: 125,
    description: 'Қазақстанның ең ірі және беделді классикалық университеті',
    programs: ['Физика', 'Математика', 'Филология', 'Құқық'],
    tuition: 'Грант / 600,000₸',
    website: 'kaznu.kz',
    color: 'emerald'
  },
  {
    id: 3,
    name: 'Satbayev University',
    nameEn: 'Satbayev University',
    logo: '⚙️',
    city: 'Алматы',
    type: 'Техникалық',
    rating: 5,
    students: '12000+',
    grantScore: 130,
    description: 'Техникалық және инженерлік білім берудің жетекші орталығы',
    programs: ['Мұнай-газ', 'Тау-кен', 'Робототехника', 'IT'],
    tuition: 'Грант / 550,000₸',
    website: 'satbayev.university',
    color: 'orange'
  },
  {
    id: 4,
    name: 'КБТУ',
    nameEn: 'KBTU',
    logo: '💻',
    city: 'Алматы',
    type: 'IT/Бизнес',
    rating: 5,
    students: '5000+',
    grantScore: 135,
    description: 'IT және бизнес мамандықтары бойынша озық университет',
    programs: ['Computer Science', 'Data Science', 'Business', 'Финансы'],
    tuition: 'Грант / 1,200,000₸',
    website: 'kbtu.kz',
    color: 'purple'
  },
  {
    id: 5,
    name: 'ҚазҰМУ',
    nameEn: 'Asfendiyarov Medical University',
    logo: '🏥',
    city: 'Алматы',
    type: 'Медициналық',
    rating: 5,
    students: '8000+',
    grantScore: 135,
    description: 'Қазақстанның ең үлкен медициналық жоғары оқу орны',
    programs: ['Жалпы медицина', 'Стоматология', 'Фармация', 'Медбио'],
    tuition: 'Грант / 800,000₸',
    website: 'kaznmu.kz',
    color: 'red'
  },
  {
    id: 6,
    name: 'Абай атындағы ҚазҰПУ',
    nameEn: 'Abai Kazakh National Pedagogical University',
    logo: '👨‍🏫',
    city: 'Алматы',
    type: 'Педагогикалық',
    rating: 4,
    students: '15000+',
    grantScore: 115,
    description: 'Педагогикалық кадрларды даярлаудың негізгі орталығы',
    programs: ['Педагогика', 'Психология', 'Филология', 'Тарих'],
    tuition: 'Грант / 400,000₸',
    website: 'kaznpu.kz',
    color: 'green'
  },
  {
    id: 7,
    name: 'Л.Н. Гумилев атындағы ЕҰУ',
    nameEn: 'Gumilyov Eurasian National University',
    logo: '🌏',
    city: 'Астана',
    type: 'Классикалық',
    rating: 4,
    students: '18000+',
    grantScore: 120,
    description: 'Астанадағы ірі классикалық университет',
    programs: ['Хал.қ. қатынастар', 'Журналистика', 'Құқық', 'Экономика'],
    tuition: 'Грант / 500,000₸',
    website: 'enu.kz',
    color: 'indigo'
  },
  {
    id: 8,
    name: 'SDU',
    nameEn: 'Suleyman Demirel University',
    logo: '🎯',
    city: 'Қаскелең',
    type: 'Халықаралық',
    rating: 5,
    students: '3000+',
    grantScore: 130,
    description: 'Түрік-қазақ халықаралық университеті',
    programs: ['Инженерия', 'Бизнес', 'IT', 'Медицина'],
    tuition: 'Грант / 900,000₸',
    website: 'sdu.edu.kz',
    color: 'cyan'
  }
]

export default function UniversitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredUniversities = UNIVERSITIES.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.city.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === 'all' || uni.type === filterType

    return matchesSearch && matchesFilter
  })

  const types = ['all', ...Array.from(new Set(UNIVERSITIES.map(u => u.type)))]

  return (
    <main className="min-h-screen bg-white dark:bg-dark-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-zerdeli-50 to-white dark:from-dark-bgSecondary dark:to-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-dark-text mb-4">
              Қазақстанның Үздік <span className="text-gradient-zerdeli">Университеттері</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-dark-textSecondary">
              Грант алу үшін қажетті балл, мамандықтар және толық ақпарат
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Университет іздеу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-zerdeli-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      filterType === type
                        ? 'bg-zerdeli-500 text-slate-900 dark:text-white'
                        : 'bg-gray-100 dark:bg-dark-bgTertiary text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-cardHover'
                    }`}
                  >
                    {type === 'all' ? 'Барлығы' : type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map(uni => (
              <Card key={uni.id} hover className="group">
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{uni.logo}</div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-dark-text group-hover:text-zerdeli-600 dark:group-hover:text-zerdeli-400 transition-colors">
                          {uni.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-dark-textTertiary">{uni.nameEn}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Type */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(uni.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <Badge variant="default">{uni.type}</Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-dark-textSecondary line-clamp-2">
                    {uni.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-dark-border">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-zerdeli-500" />
                      <span className="text-gray-700 dark:text-dark-textSecondary">{uni.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-zerdeli-500" />
                      <span className="text-gray-700 dark:text-dark-textSecondary">{uni.students}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-gray-700 dark:text-dark-textSecondary">ҰБТ: {uni.grantScore}+</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-zerdeli-500" />
                      <span className="text-gray-700 dark:text-dark-textSecondary">{uni.tuition}</span>
                    </div>
                  </div>

                  {/* Programs */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {uni.programs.slice(0, 3).map((program, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-md bg-zerdeli-50 dark:bg-zerdeli-950 text-zerdeli-700 dark:text-zerdeli-300 border border-zerdeli-200 dark:border-zerdeli-800"
                      >
                        {program}
                      </span>
                    ))}
                    {uni.programs.length > 3 && (
                      <span className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-dark-bgTertiary text-gray-600 dark:text-dark-textSecondary">
                        +{uni.programs.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
                    <a
                      href={`https://${uni.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-zerdeli-600 dark:text-zerdeli-400 hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{uni.website}</span>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredUniversities.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
                Университет табылмады
              </h3>
              <p className="text-gray-600 dark:text-dark-textSecondary">
                Басқа іздеу сөзін немесе фильтрді қолданып көріңіз
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
