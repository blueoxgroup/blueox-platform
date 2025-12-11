# Vercel Deployment Guide

## Repository Setup

Your Blue OX Platform repository is now available at:
**https://github.com/blueoxgroup/blueox-platform**

## Deployment Steps

### Step 1: Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `blueoxgroup/blueox-platform`

### Step 2: Configure Two Separate Deployments

You need to create TWO separate Vercel projects:

#### A. Main Website (blueox)
- **Project Name**: `blueox-main`
- **Framework Preset**: Vite
- **Root Directory**: `./blueox`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

#### B. Admin Portal (blueox-admin)
- **Project Name**: `blueox-admin`
- **Framework Preset**: Vite
- **Root Directory**: `./blueox-admin`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### Step 3: Environment Variables

For BOTH projects, add these environment variables:

```
VITE_SUPABASE_URL=https://pvmcwgylcnedgvbjdler.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bWN3Z3lsY25lZGd2YmpkbGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNjA2MTksImV4cCI6MjA4MDkzNjYxOX0.3ILSwPRsvCYelH9d8ZZxEb53Ja1XurXYy59nqepLhAs
```

### Step 4: Custom Domain Configuration

#### Main Website
1. Go to Project Settings > Domains
2. Add domain: `blueoxjobs.eu`
3. Add subdomain: `www.blueoxjobs.eu`

#### Admin Portal
1. Go to Project Settings > Domains
2. Add domain: `admin.blueoxjobs.eu`

### Step 5: DNS Configuration (Namecheap)

Add these DNS records in your Namecheap dashboard:

#### For Main Website (blueoxjobs.eu)
```
Type: CNAME
Host: @
Value: cname.vercel-dns.com

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

#### For Admin Portal (admin.blueoxjobs.eu)
```
Type: CNAME
Host: admin
Value: cname.vercel-dns.com
```

### Step 6: Deploy

1. Click "Deploy" for each project
2. Wait for builds to complete
3. Vercel will automatically configure SSL certificates
4. Test both deployments

## Expected URLs After Deployment

- **Main Website**: https://blueoxjobs.eu (and https://www.blueoxjobs.eu)
- **Admin Portal**: https://admin.blueoxjobs.eu

## Verification Steps

1. Visit both URLs and verify they load correctly
2. Test admin login with: `czkoeykr@minimax.com` / `DXaTUz2qr9`
3. Test user registration on main site
4. Verify admin dashboard shows new users
5. Test document upload functionality

## Troubleshooting

### Build Errors
- Ensure Node.js version 18+ is selected
- Check that pnpm is available in the build environment
- Verify all dependencies are correctly installed

### Environment Variables
- Double-check Supabase credentials
- Ensure variables are prefixed with `VITE_`
- Variables should be set in Vercel dashboard, not in .env files

### Custom Domain Issues
- DNS propagation can take 24-48 hours
- Use DNS checker tools to verify propagation
- Ensure SSL certificates are issued (usually automatic)

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables are set correctly
3. Ensure DNS records are properly configured
4. Test with Vercel's default domains first (e.g., `your-project.vercel.app`)

Your platform is production-ready and all configurations have been optimized for deployment.
