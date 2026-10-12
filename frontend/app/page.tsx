'use client'

import React from 'react'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { WhyZerdeli } from '@/components/WhyZerdeli'
import { SocialProof } from '@/components/SocialProof'
import { TeachersSection } from '@/components/TeachersSection'
import { CourseCatalog } from '@/components/CourseCatalog'
import { TariffPlans } from '@/components/TariffPlans'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <Navbar />
      <Hero />
      <WhyZerdeli />
      <SocialProof />
      <TeachersSection />
      <CourseCatalog />
      <TariffPlans />
      <Footer />
    </main>
  )
}
