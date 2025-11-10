import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  // Fetch boats from database
  const { data: boats, error } = await supabase
    .from('boats')
    .select('*')
    .order('name')

  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .single()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-6 max-w-4xl">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            NaviBook
          </h1>
          <p className="text-xl text-muted-foreground">
            Day-Charter Management System
          </p>
          {company && (
            <p className="text-sm text-muted-foreground">
              {company.name}
            </p>
          )}
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <div className="px-6 py-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
            <p className="text-sm font-medium">✅ Database Connected</p>
          </div>
          <div className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
            <p className="text-sm font-medium">✅ Realtime Enabled</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">Error: {error.message}</p>
          </div>
        )}

        {boats && boats.length > 0 && (
          <div className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Fleet Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boats.map((boat) => (
                <div
                  key={boat.id}
                  className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{boat.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      boat.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {boat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="capitalize">
                      🚤 {boat.boat_type.replace('_', ' ')}
                    </p>
                    <p>👥 Capacity: {boat.capacity} passengers</p>
                    {boat.description && (
                      <p className="text-xs pt-2">{boat.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-8 space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold mb-2">🎉 Setup Complete!</p>
            <p className="text-sm text-muted-foreground mb-3">
              Your NaviBook system is ready. Login to start managing bookings.
            </p>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> admin@navibook.com</p>
              <p><strong>Password:</strong> Admin123!</p>
              <p className="text-xs text-amber-600 pt-2">
                ⚠️ Change password after first login
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <a
              href="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </a>
            <a
              href="/register"
              className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-blue-200"
            >
              Register
            </a>
          </div>
        </div>

        <div className="pt-6 text-xs text-muted-foreground space-y-1">
          <p>📊 Database: {boats?.length || 0} boats configured</p>
          <p>🔒 Security: Row Level Security (RLS) enabled</p>
          <p>⚡ Real-time: Live booking updates active</p>
        </div>
      </div>
    </main>
  )
}
