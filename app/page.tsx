import { createClient } from '@/lib/supabase/server'
import { Calendar, BarChart3, Shield, Zap, Users, Anchor } from 'lucide-react'

// NaviBook landing page
export default async function Home() {
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .single()

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

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-6 py-32 sm:py-48">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl sm:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                NaviBook
              </span>
            </h1>
            <p className="text-2xl text-gray-300 font-light">
              Complete Day-Charter Management Platform
            </p>
          </div>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Streamline bookings, optimize fleet operations, and maximize revenue with intelligent scheduling and real-time analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <a
              href="/login"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Get Started
            </a>
            <a
              href="/register"
              className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Request Demo
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-white">Powerful Features</h2>
          <p className="text-lg text-gray-400">Everything you need to run a modern charter business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group relative p-8 rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-400">100%</div>
              <p className="text-gray-400 font-medium">Uptime SLA</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-cyan-400">Real-time</div>
              <p className="text-gray-400 font-medium">Data Sync</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-emerald-400">Enterprise</div>
              <p className="text-gray-400 font-medium">Grade Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8">
        <h2 className="text-4xl font-bold text-white">Ready to Transform Your Business?</h2>
        <p className="text-lg text-gray-400">Join charter operators who trust NaviBook to run their operations.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Login to Dashboard
          </a>
          <a
            href="/register"
            className="px-8 py-3 border-2 border-blue-600 text-blue-400 rounded-lg font-semibold hover:border-blue-500 hover:bg-gray-800 transition-colors"
          >
            Create Account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-800/50 px-6 py-8 text-center text-sm text-gray-400">
        <p>NaviBook © 2026 • {company?.name}</p>
      </footer>
    </main>
  )
}
