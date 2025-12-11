# Blue OX Jobs Platform

A comprehensive job placement and workforce development platform built with React, TypeScript, and Supabase.

## Project Structure

This repository contains two main applications:

- **`blueox/`** - Main website with student/workforce portals
- **`blueox-admin/`** - Admin dashboard for CRM and management

## Features

### Main Website (blueox/)
- Student registration and workforce portals
- Job applications and document uploads
- Study program selection
- User authentication with email verification
- Responsive design with Tailwind CSS

### Admin Portal (blueox-admin/)
- Client management (view all registered users)
- Application tracking
- Document management
- Payment phase tracking
- Job posting management (31 jobs pre-loaded)
- CRM functionality

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Deployment**: Vercel
- **Domain**: blueoxjobs.eu (main), admin.blueoxjobs.eu (admin)

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/blueox-platform.git
cd blueox-platform
```

2. Install dependencies for both applications:
```bash
cd blueox && pnpm install
cd ../blueox-admin && pnpm install
```

### Environment Setup

Create `.env` files in both project directories with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

Run the applications:

```bash
# Main website (port 3000)
cd blueox && pnpm dev

# Admin portal (port 3001)
cd blueox-admin && pnpm dev
```

### Build for Production

```bash
# Main website
cd blueox && pnpm build

# Admin portal
cd blueox-admin && pnpm build
```

## Deployment

This project is configured for deployment on Vercel:

1. **Main Website**: [blueoxjobs.eu](https://blueoxjobs.eu)
2. **Admin Portal**: [admin.blueoxjobs.eu](https://admin.blueoxjobs.eu)

### Custom Domain Setup

The platform uses custom domains from Namecheap:
- Main site: blueoxjobs.eu
- Admin portal: admin.blueoxjobs.eu

DNS records are configured to point to Vercel's CDN.

## Database Schema

### Core Tables
- **clients** - User profiles and authentication
- **applications** - Job applications
- **documents** - Uploaded user documents
- **jobs** - Available job positions
- **payments** - Payment tracking
- **client_payment_phases** - Client payment status

### Key Features
- Row Level Security (RLS) policies
- Automatic user sync from Supabase Auth
- Document storage with Supabase Storage
- Admin role-based access control

## API Endpoints

### Supabase Edge Functions
- `create-admin-user` - Admin user creation
- `fix-admin` - Admin permissions fix
- `create-bucket-client-documents-temp` - Storage setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Proprietary - Blue OX Jobs Platform

## Support

For technical support or questions, please contact the development team.
