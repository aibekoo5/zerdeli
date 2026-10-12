'use client'

import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import {
  GraduationCap,
  Send,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Youtube,
  Facebook,
  BookOpen,
  Award,
  Clock
} from 'lucide-react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 dark:bg-dark-bgSecondary border-t border-gray-200 dark:border-dark-border pt-16 pb-8 relative">
      {/* Background gradient effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zerdeli-100/20 dark:from-zerdeli-950/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-gray-200 dark:border-dark-border">

          {/* Col 1: Zerdeli Brand Info */}
          <div className="lg:col-span-2 space-y-5">
            <Logo size="lg" showText={true} />

            <p className="text-sm text-gray-600 dark:text-dark-textSecondary max-w-sm leading-relaxed">
              Zerdeli — NIS, BIL, RFMSH және ҰБТ дайындығына арналған озық білім беру платформасы.
              Тәжірибелі оқытушылар, заманауи технологиялар және кешенді дайындық бағдарламалары.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-textSecondary">
                <BookOpen className="w-4 h-4 text-zerdeli-500" />
                <span>50+ курс</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-textSecondary">
                <Award className="w-4 h-4 text-amber-500" />
                <span>95% нәтиже</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-textSecondary">
                <GraduationCap className="w-4 h-4 text-zerdeli-500" />
                <span>100+ оқытушы</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-textSecondary">
                <Clock className="w-4 h-4 text-zerdeli-500" />
                <span>24/7 қолдау</span>
              </div>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text uppercase tracking-wider">Платформа</h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-dark-textSecondary">
              <li>
                <Link href="#courses" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  Курстар каталогы
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  Мұғалімдер
                </Link>
              </li>
              <li>
                <Link href="/universities" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  Университеттер
                </Link>
              </li>
              <li>
                <Link href="/grants" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  Гранттар
                </Link>
              </li>
              <li>
                <Link href="#tariffs" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  Тарифтер
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Exam Directions */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text uppercase tracking-wider">Бағыттар</h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-dark-textSecondary">
              <li>
                <Link href="#directions" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  NIS дайындық
                </Link>
              </li>
              <li>
                <Link href="#directions" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  BIL дайындық
                </Link>
              </li>
              <li>
                <Link href="#directions" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  RFMSH дайындық
                </Link>
              </li>
              <li>
                <Link href="#directions" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  ҰБТ дайындық
                </Link>
              </li>
              <li>
                <Link href="#directions" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
                  Мат-Физика бейіні
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Socials */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text uppercase tracking-wider">Байланыс</h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-dark-textSecondary">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-zerdeli-500" />
                <a href="tel:+77012345678" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 font-medium">
                  +7 (701) 234-56-78
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-zerdeli-500" />
                <a href="mailto:info@zerdeli.kz" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400">
                  info@zerdeli.kz
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-zerdeli-500 shrink-0 mt-0.5" />
                <span>Алматы қ., Астана қ.</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-3">
              <div className="text-xs font-semibold text-gray-700 dark:text-dark-textSecondary mb-3">Әлеуметтік желілер</div>
              <div className="flex gap-2.5">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-dark-textSecondary hover:text-pink-600 hover:border-pink-500 dark:hover:text-pink-400 dark:hover:border-pink-500 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-dark-textSecondary hover:text-red-600 hover:border-red-500 dark:hover:text-red-400 dark:hover:border-red-500 transition-all"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-dark-textSecondary hover:text-blue-600 hover:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-500 transition-all"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-dark-textSecondary hover:text-blue-700 hover:border-blue-700 dark:hover:text-blue-400 dark:hover:border-blue-500 transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-dark-textSecondary">
            © {currentYear} Zerdeli. Барлық құқықтар қорғалған.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-dark-textTertiary">
            <Link href="/privacy" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
              Құпиялылық
            </Link>
            <Link href="/terms" className="hover:text-zerdeli-600 dark:hover:text-zerdeli-400 transition-colors">
              Шарттар
            </Link>
            <span className="flex items-center gap-1.5">
              Made with 💚
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
