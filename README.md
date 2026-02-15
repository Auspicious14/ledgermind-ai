# 🚀 LedgerMind AI - Revenue Intelligence Engine

**AI-powered revenue analytics and business intelligence platform for small businesses.**

Transform your transaction data into actionable insights with automated analytics, forecasting, anomaly detection, and AI-driven recommendations.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204-purple)

---

## ✨ Features

### 📊 Core Analytics
- **Revenue & Profit Tracking** - Daily and monthly aggregations
- **Product Performance Analysis** - Top/bottom performers by revenue and profit
- **Margin Analysis** - Profitability metrics across products
- **Business Health Scoring** - Weighted score across 4 dimensions

### 📈 Forecasting & Prediction
- **30-Day Revenue Forecast** - Linear regression with confidence intervals
- **Trend Analysis** - Increasing/decreasing/stable classifications
- **Growth Rate Calculation** - Month-over-month tracking
- **Model Accuracy (R²)** - Transparent prediction quality

### ⚠️ Anomaly Detection
- **Statistical Anomaly Detection** - Z-score based identification
- **Spike & Drop Classification** - Automated categorization
- **Severity Levels** - High/medium/low priority flagging
- **Pattern Recognition** - Consecutive anomaly streak detection
- **Human-Readable Explanations** - Context-aware descriptions

### 🤖 AI-Powered Insights
- **Claude AI Integration** - Intelligent business analysis
- **6 Insight Categories** - Revenue, profitability, risk, opportunity, warning, general
- **Priority Scoring** - High/medium/low based on business impact
- **Actionable Recommendations** - Specific next steps
- **Executive Summaries** - High-level business health overview
- **Fallback Logic** - Deterministic insights when API unavailable

### 📄 Professional Reports
- **PDF Export** - Comprehensive business health reports
- **Print-Optimized** - Clean formatting for physical copies
- **HTML Download** - Shareable browser-based reports
- **Visual Data Presentation** - Charts, tables, and highlights

### 🎨 Modern Dashboard UI
- **KPI Cards** - Revenue, profit, margin, health score
- **Interactive Charts** - Revenue trends, forecasts, anomalies
- **Product Tables** - Sortable performance metrics
- **Insight Panel** - Expandable AI recommendations
- **Responsive Design** - Mobile, tablet, and desktop optimized

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL

**AI:**
- Anthropic Claude Sonnet 4
- Deterministic fallback analytics

**Core Modules:**
- `/src/core/analytics.ts` - Revenue calculations
- `/src/core/forecasting.ts` - Linear regression
- `/src/core/anomaly.ts` - Z-score detection
- `/src/core/insight-engine.ts` - AI integration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or use Neon/Supabase free tier)
- Anthropic API key (optional, for AI features)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd ledgermind-ai

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data (optional)
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3000

---

## 📦 Project Structure

```
ledgermind-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── upload/        # CSV upload
│   │   │   ├── analytics/     # Analytics endpoint
│   │   │   ├── insights/      # AI insights
│   │   │   └── report/        # PDF generation
│   │   ├── dashboard/         # Dashboard page
│   │   ├── upload/            # Upload page
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   └── upload/            # Upload components
│   ├── core/                  # Business logic (pure TS)
│   │   ├── analytics.ts       # Revenue calculations
│   │   ├── forecasting.ts     # Prediction models
│   │   ├── anomaly.ts         # Anomaly detection
│   │   └── insight-engine.ts  # AI insights
│   ├── lib/                   # Utilities
│   │   ├── db.ts             # Prisma client
│   │   ├── csv-parser.ts     # CSV processing
│   │   ├── api-client.ts     # API helpers
│   │   └── utils.ts          # Formatting
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
└── public/                    # Static assets
```

---

## 🔑 Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:password@host:5432/db"

# Optional (AI features)
OPENAI_API_KEY="sk-ant-..."  # Anthropic API key

# Auto-generated by Next.js
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📊 Database Schema

```prisma
model Business {
  id           String        @id @default(cuid())
  name         String
  industry     String?
  transactions Transaction[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Transaction {
  id          String   @id @default(cuid())
  businessId  String
  business    Business @relation(...)
  date        DateTime
  productName String
  category    String?
  quantity    Float
  revenue     Float
  cost        Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Indexes:**
- businessId, date (composite)
- productName
- date

---

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/business` | GET | List all businesses |
| `/api/business` | POST | Create new business |
| `/api/upload` | POST | Upload CSV transactions |
| `/api/upload` | GET | Download sample CSV |
| `/api/analytics` | GET | Get full analytics |
| `/api/insights` | GET | Generate AI insights |
| `/api/transactions` | GET | List transactions (paginated) |
| `/api/transactions` | DELETE | Delete all transactions |
| `/api/report` | GET | Generate PDF report |

---

## 🧪 Testing

### Manual Testing
```bash
# 1. Start server
npm run dev

# 2. Create a business at /upload
# 3. Upload sample CSV
# 4. View dashboard at /dashboard
# 5. Test PDF export
# 6. Verify all charts render
```

### Sample CSV Format
```csv
date,productName,category,quantity,revenue,cost
2024-01-01,Espresso,Beverage,10,35.00,8.00
2024-01-01,Croissant,Food,5,17.50,5.00
```

Download sample: http://localhost:3000/api/upload

---

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Secondary**: Purple (#8b5cf6)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Danger**: Red (#ef4444)

### Components
All components use Tailwind CSS utility classes:
- Consistent spacing (p-6, gap-6, mb-8)
- Rounded corners (rounded-lg, rounded-xl)
- Shadows (shadow-sm, shadow-md)
- Hover states on all interactive elements

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Recommended Platforms:**
- **Vercel** - Easiest, auto-deploys
- **Railway** - Simple, includes Postgres
- **DigitalOcean** - Full control

**Database Options:**
- **Neon** - Free tier, serverless Postgres
- **Supabase** - Postgres + extras
- **Vercel Postgres** - Integrated with Vercel

---

## 🔒 Security

- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React escaping)
- ✅ CSRF tokens (Next.js built-in)
- ✅ Environment variables for secrets
- ✅ Rate limiting ready (add @upstash/ratelimit)

**TODO for Production:**
- [ ] Add authentication (NextAuth.js)
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Set up monitoring (Sentry)

---

## 📈 Performance

**Current Optimizations:**
- Database indexes on frequently queried fields
- Single-pass algorithms in core modules
- Batch inserts for large CSV uploads
- Client-side caching with React state
- Lazy loading of insights

**Future Improvements:**
- Redis caching for analytics results
- Background job processing for large uploads
- Database connection pooling
- CDN for static assets

---

## 🤝 Contributing

This is a hackathon project, but contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Anthropic** - Claude AI for insights
- **Vercel** - Next.js and hosting platform
- **Prisma** - Database ORM
- **Recharts** - Visualization library

---

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help

---

**Built for hackathon success. Good luck! 🚀**

Star ⭐ this repo if you found it helpful!