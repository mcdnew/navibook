'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, Calendar, BarChart3, Shield, Zap, Users, Anchor } from 'lucide-react'

interface LandingClientProps {
  companyName?: string
}

export default function LandingClient({ companyName }: LandingClientProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      setIsDark(saved === 'dark')
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  const features = [
    {
      icon: Calendar,
      title: 'Smart Booking Engine',
      description: 'Real-time availability, instant confirmations, and automated scheduling',
    },
    {
      icon: BarChart3,
      title: 'Revenue Analytics',
      description: 'Track profitability per boat, monitor operational costs, and analyze trends',
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Assign captains, track crew assignments, and manage commissions seamlessly',
    },
    {
      icon: Anchor,
      title: 'Fleet Operations',
      description: 'Maintenance logs, fuel tracking, safety equipment, and fleet compliance',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Row-level security, encrypted data, and role-based access control',
    },
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Live updates across all devices, instant notifications, and sync on demand',
    },
  ]

  if (!mounted) return null

  const bgColor = isDark ? 'bg-slate-950' : 'bg-white'
  const heroBg = isDark ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950' : 'bg-gradient-to-b from-blue-50 via-white to-white'
  const headingColor = isDark ? 'text-white' : 'text-gray-900'
  const textColor = isDark ? 'text-slate-300' : 'text-gray-600'
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const cardHoverBg = isDark ? 'hover:border-blue-500' : 'hover:border-blue-300'
  const cardTextColor = isDark ? 'text-slate-300' : 'text-gray-600'
  const buttonBg = isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
  const buttonOutline = isDark ? 'border-blue-400 text-blue-400 hover:bg-slate-800/50' : 'border-blue-600 text-blue-600 hover:bg-blue-50'
  const statsBg = isDark ? 'bg-gradient-to-r from-slate-900 to-slate-950' : 'bg-gradient-to-r from-blue-50 to-white'
  const statsText = isDark ? 'text-slate-300' : 'text-gray-600'
  const footerBg = isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50 border-gray-200'
  const footerText = isDark ? 'text-slate-400' : 'text-gray-600'

  return (
    <main className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {/* Hero Section */}
      <section className={`relative overflow-hidden ${heroBg} px-6 py-32 sm:py-48`}>
        <div className="absolute inset-0 overflow-hidden">
          {isDark ? (
            <>
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
            </>
          ) : (
            <>
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl"></div>
            </>
          )}
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className={`text-6xl sm:text-7xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-blue-500">NaviBook</span>
            </h1>
            <p className={`text-2xl font-light ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Complete Day-Charter Management Platform
            </p>
          </div>

          <p className={`text-lg max-w-2xl mx-auto ${textColor}`}>
            Streamline bookings, optimize fleet operations, and maximize revenue with intelligent scheduling and real-time analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <a
              href="/login"
              className={`px-8 py-3 ${buttonBg} text-white rounded-lg font-semibold transition-colors`}
            >
              Get Started
            </a>
            <a
              href="/register"
              className={`px-8 py-3 border-2 ${buttonOutline} rounded-lg font-semibold transition-colors`}
            >
              Request Demo
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className={`text-4xl font-bold ${headingColor}`}>Powerful Features</h2>
          <p className={`text-lg ${textColor}`}>Everything you need to run a modern charter business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className={`group relative p-8 rounded-xl border ${cardBg} ${cardHoverBg} hover:shadow-lg transition-all duration-300`}
              >
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-blue-500/5' : 'bg-blue-50'}`}></div>
                <div className="relative space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold ${headingColor}`}>{feature.title}</h3>
                  <p className={cardTextColor}>{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className={`${statsBg} px-6 py-20`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className={`text-4xl font-bold text-blue-500`}>100%</div>
              <p className={`${statsText} font-medium`}>Uptime SLA</p>
            </div>
            <div className="space-y-2">
              <div className={`text-4xl font-bold text-blue-500`}>Real-time</div>
              <p className={`${statsText} font-medium`}>Data Sync</p>
            </div>
            <div className="space-y-2">
              <div className={`text-4xl font-bold text-blue-500`}>Enterprise</div>
              <p className={`${statsText} font-medium`}>Grade Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`max-w-4xl mx-auto px-6 py-20 text-center space-y-8`}>
        <h2 className={`text-4xl font-bold ${headingColor}`}>Ready to Transform Your Business?</h2>
        <p className={`text-lg ${textColor}`}>Join charter operators who trust NaviBook to run their operations.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className={`px-8 py-3 ${buttonBg} text-white rounded-lg font-semibold transition-colors`}
          >
            Login to Dashboard
          </a>
          <a
            href="/register"
            className={`px-8 py-3 border-2 ${buttonOutline} rounded-lg font-semibold transition-colors`}
          >
            Create Account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${footerBg} px-6 py-8 text-center text-sm ${footerText}`}>
        <p>NaviBook © 2026 • {companyName}</p>
      </footer>
    </main>
  )
}
