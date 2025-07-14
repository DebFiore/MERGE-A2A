# 🚀 MERGE AI - Production Deployment Guide

## Quick Deployment to mergeleads.ai

### Prerequisites
- GitHub repository connected to Vercel
- Custom domain: `mergeleads.ai` 
- PostgreSQL database (recommended: Vercel Postgres or Supabase)

## 🔧 Vercel Configuration

### 1. Environment Variables in Vercel Dashboard

Set these in your Vercel project settings:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_URL="https://mergeleads.ai"
NEXTAUTH_SECRET="your-32-character-secret-key"

# VAPI Integration
VAPI_API_KEY="your-vapi-api-key"
VAPI_WEBHOOK_SECRET="your-vapi-webhook-secret"

# App Configuration
NEXT_PUBLIC_DOMAIN="https://mergeleads.ai"
NEXT_PUBLIC_APP_NAME="MERGE AI"

# Optional: Email Configuration
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT="587"
SMTP_USER="your-email@mergeleads.ai"
SMTP_PASS="your-email-password"
```

### 2. Build Configuration

Vercel will automatically use:
- **Build Command**: `npm run vercel-build`
- **Install Command**: `npm ci`
- **Output Directory**: `.next`

### 3. Domain Configuration

1. Add `mergeleads.ai` as custom domain in Vercel
2. Configure DNS records:
   ```
   A Record: @ → 76.76.19.142
   CNAME: www → cname.vercel-dns.com
   ```

## 📊 Database Setup

### Option A: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage → Create Database
2. Select PostgreSQL
3. Copy connection string to `DATABASE_URL`

### Option B: Supabase
1. Create project at supabase.com
2. Go to Settings → Database
3. Copy PostgreSQL connection string

### Database Migration
After deployment, Vercel will automatically run:
```bash
prisma generate
prisma migrate deploy
```

## 🎯 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: enhanced dashboard with CSV upload and analytics

🎉 Complete enhanced dashboard features:
- Drag & drop CSV upload with real-time validation
- Bulk lead import with duplicate handling  
- Real-time analytics dashboard with auto-refresh
- Enhanced lead status tracking
- Papa Parse integration for CSV processing
- Professional UI with progress indicators

🚀 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

### 2. Vercel Auto-Deploy
- Vercel will automatically detect the push
- Build process will run `npm run vercel-build`
- Database migrations will be applied
- Site will be live at temporary Vercel URL

### 3. Custom Domain Setup
- Add `mergeleads.ai` in Vercel dashboard
- Update DNS records as provided
- SSL certificate will be automatically generated

## 🔒 Security Checklist

- ✅ Environment variables set in Vercel
- ✅ Database connection secured
- ✅ NEXTAUTH_SECRET is cryptographically secure
- ✅ VAPI webhook secret configured
- ✅ Email credentials secured (if using)

## 🧪 Post-Deployment Testing

1. **Authentication Flow**
   - Registration: `https://mergeleads.ai/register`
   - Email verification
   - Onboarding: `https://mergeleads.ai/onboarding`

2. **Dashboard Features**  
   - Main dashboard: `https://mergeleads.ai/dashboard`
   - CSV upload: `https://mergeleads.ai/dashboard/upload`
   - Real-time analytics and auto-refresh

3. **API Endpoints**
   - Bulk import: `POST /api/leads/bulk-import`
   - User authentication: `GET /api/auth/me`
   - Subdomain validation: `POST /api/auth/check-subdomain`

## 📈 Performance Optimization

- Next.js static generation for optimal performance
- PostgreSQL with connection pooling
- Vercel Edge Network for global CDN
- Automatic image optimization

## 🔄 Continuous Deployment

Every push to `main` branch will:
1. Trigger Vercel build
2. Run database migrations  
3. Deploy to production
4. Update `https://mergeleads.ai`

## 🎯 Success Metrics

After deployment, you'll have:
- ✅ Professional multi-tenant SaaS platform
- ✅ Complete client onboarding system
- ✅ Enhanced CSV upload with validation
- ✅ Real-time analytics dashboard
- ✅ Bulk lead import capabilities
- ✅ Scalable architecture ready for growth

---

## 🆘 Troubleshooting

### Common Issues:

**Build Fails**
- Check environment variables are set
- Verify DATABASE_URL format
- Ensure all dependencies are in package.json

**Database Connection**  
- Verify DATABASE_URL in Vercel dashboard
- Check database server is accessible
- Confirm credentials are correct

**Custom Domain**
- DNS propagation can take 24-48 hours
- Verify DNS records are correctly set
- Check domain ownership in Vercel

Ready to launch! 🚀