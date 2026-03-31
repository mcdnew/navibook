# NaviBook - Day-Charter Boat Rental Management System

A complete web-based reservation management system for Mediterranean day-charter boat rental companies. Features real-time availability, mobile-first booking interface, commission tracking, weather integration, and fleet operations management.

## 🚀 Features

- **Mobile-First Booking**: Optimized for agents using phones at the port
- **Real-time Sync**: Instant availability updates across all users
- **Multi-Boat Fleet**: Manage sailboats, motorboats, and jet-skis
- **Commission Tracking**: Automatic calculation and settlement reporting
- **Weather Integration**: Safety scoring with Open-Meteo API
- **External APIs**: Accept bookings from partner websites
- **Role-Based Access**: Admin, office staff, agents, and captains
- **Audit Trail**: Complete booking history logging

## 🛠️ Tech Stack

- **Frontend**: Next.js 14.2, React 18, TypeScript 5
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier works)
- Git

## 🏁 Getting Started

### 1. Clone and Install

```bash
cd day-charter
pnpm install
```

### 2. Set Up Supabase

Follow the detailed guide: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

Quick steps:
1. Create Supabase project at https://supabase.com
2. Copy `.env.example` to `.env.local`
3. Add your Supabase URL and keys to `.env.local`
4. Run migrations in Supabase SQL Editor

### 3. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Create First Admin User

1. Go to Supabase Dashboard → Authentication → Users → Add User
2. Create user with email/password
3. Copy the User ID
4. Run SQL to add to users table (see SUPABASE_SETUP.md)

## 📁 Project Structure

```
day-charter/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Desktop dashboard layout
│   ├── (mobile)/          # Mobile-optimized pages
│   └── api/               # API routes & webhooks
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── booking/          # Booking-related components
│   └── fleet/            # Fleet management components
├── lib/                  # Utilities and configurations
│   ├── supabase/         # Supabase client setup
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand stores
│   └── utils/            # Helper functions
├── supabase/             # Supabase configuration
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
└── public/               # Static assets
```

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, manage users, boats, settings |
| **Office Staff** | View all bookings, create/edit bookings, reports |
| **Manager** | Similar to office staff, limited admin access |
| **Accountant** | View-only access to financial reports |
| **Power Agent** | Create bookings, higher commission rate |
| **Regular Agent** | Create bookings, view own bookings |
| **Captain** | View assigned bookings, update status |

## 📱 Mobile-First Design

The booking interface is optimized for mobile devices:

- Touch-optimized buttons (min 44x44px)
- Simple, linear booking flow
- Offline capability with sync
- Bottom navigation for easy thumb access
- Large, readable text

## 🔄 Real-time Features

Powered by Supabase Realtime:

- Instant booking updates across all devices
- Live availability changes
- Weather forecast updates
- Fleet status changes

## 🌊 Weather Integration

- Fetches marine weather from Open-Meteo API
- Calculates safety scores per boat type
- Prevents bookings in dangerous conditions
- Visual weather warnings on calendar

## 📊 Key Workflows

### Creating a Booking

1. Agent selects date, time, duration
2. System shows available boats
3. Agent enters customer details
4. 15-minute soft hold applied
5. Confirmation creates booking
6. Commission auto-calculated
7. Real-time update to all users

### External Bookings

1. Partner website sends webhook
2. API validates and checks availability
3. Booking created if available
4. Confirmation sent to partner
5. Appears in system instantly

## 🧪 Development

### Running Tests

```bash
pnpm run test
```

### Type Checking

```bash
pnpm run type-check
```

### Linting

```bash
pnpm run lint
```

### Building for Production

```bash
pnpm run build
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Vercel will automatically:
- Build the Next.js app
- Set up cron jobs for weather updates
- Configure webhooks

### Environment Variables

Required in production:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WEBHOOK_SECRET=
OPEN_METEO_API_URL=
```

## 📖 API Documentation

### Webhook Endpoint

```bash
POST /api/webhooks/booking
Content-Type: application/json
X-Webhook-Secret: your-secret

{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+34600000000",
  "boat_id": "uuid",
  "booking_date": "2024-01-15",
  "start_time": "14:00",
  "duration_hours": 4,
  "passengers": 6,
  "source": "hotel-website"
}
```

### Availability Endpoint

```bash
GET /api/availability?date=2024-01-15&boat_type=sailboat
```

## 🤝 Contributing

This is a custom business solution. For questions or modifications, contact the development team.

## 📝 License

Proprietary - All Rights Reserved

## 🆘 Support

- Technical Issues: Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Database Operations: See [SUPABASE_DATABASE_GUIDE.md](./SUPABASE_DATABASE_GUIDE.md)
- Feature Requests: Contact admin
- Bug Reports: Document in [BUGS.md](./BUGS.md)

## 🎯 Roadmap

- [ ] SMS notifications
- [ ] Online payment integration
- [ ] Customer portal
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Multi-language support

## ⚡ Performance Targets

- Page load: <2s on 3G
- Search results: <500ms
- Booking confirmation: <1s
- Real-time updates: <100ms
- 99.9% uptime

---

Built with ❤️ for Mediterranean charter operators
