# Campaignify-XenoCRM

A modern, AI-powered CRM platform for managing customer campaigns and segmentation. Built with Next.js, Prisma, and MySQL.

## Features

### 1. Authentication & Security
- Google OAuth 2.0 integration via NextAuth.js
- Protected routes and secure API endpoints
- Environment variable management for sensitive data

### 2. Data Management
- Customer data import via CSV
- Order tracking and management
- Real-time data validation and error handling
- Secure data storage with MySQL (Aiven)

### 3. Customer Segmentation
- Dynamic rule builder for customer segments
- AI-powered natural language to JSON rule conversion
- Real-time segment audience calculation
- Flexible segmentation criteria:
  - Country
  - Order count
  - Total spent
  - Last visit
  - Custom rules

### 4. Campaign Management
- Create and manage marketing campaigns
- Select target segments
- Campaign status tracking:
  - DRAFT
  - SCHEDULED
  - SENDING
  - COMPLETED
  - FAILED
- AI-powered message personalization
- Campaign execution and delivery simulation
- Detailed message logs

### 5. AI Integration
- OpenRouter API integration for:
  - Natural language segment rule generation
  - AI-personalized campaign messages
- Smart campaign optimization

### 6. Modern UI/UX
- Responsive design with Tailwind CSS
- Professional dashboard layout
- Real-time activity feed
- Intuitive campaign and segment management
- Beautiful data visualization

<img src="https://github.com/user-attachments/assets/2ae500e7-db30-4455-aa30-12786403f0d2" alt="Architecture Diagram" width="500"/>


## Tech Stack

- *Frontend & Backend*: Next.js 14 (App Router)
- *Database*: MySQL (Aiven Cloud)
- *ORM*: Prisma
- *Authentication*: NextAuth.js
- *Styling*: Tailwind CSS
- *AI Integration*: OpenRouter API
- *Deployment*: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database (or Aiven account)
- Google OAuth credentials
- OpenRouter API key

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mysql://user:password@host:port/database"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
OPENROUTER_API_KEY="your-openrouter-api-key"
```


### Installation

1. Clone the repository:
bash
git clone https://github.com/yourusername/Campaignify-XenoCRM.git
cd Campaignify-XenoCRM


2. Install dependencies:
bash
npm install


3. Set up the database:
bash
npx prisma generate
npx prisma db push


4. Run the development server:
bash
npm run dev


5. Open [http://localhost:3000](http://localhost:3000) in your browser


## Project Structure

```text
campaignify-xenocrm/
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication
│   ├── campaigns/     # Campaign pages
│   ├── customers/     # Customer pages
│   ├── segments/      # Segment pages
│   └── layout.tsx     # Root layout
├── components/        # Reusable components
├── lib/               # Utility functions
├── prisma/            # Database schema
└── public/            # Static assets
```


## Database Schema

### Core Models
- User (Authentication)
- Customer (Customer Data)
- Order (Transaction Data)
- Segment (Customer Segmentation)
- Campaign (Marketing Campaigns)
- Message (Campaign Messages)

## API Endpoints

### Data Ingestion
- POST /api/customers/import - Import customers via CSV
- POST /api/orders/import - Import orders via CSV

### Campaign Management
- GET /api/campaigns - List campaigns
- POST /api/campaigns - Create campaign
- GET /api/campaigns/:id - Get campaign details
- POST /api/campaigns/:id/execute - Execute campaign

### Segmentation
- GET /api/segments - List segments
- POST /api/segments - Create segment
- GET /api/segments/:id - Get segment details
- POST /api/segments/generate-rules - AI rule generation

## Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Aiven for the managed database service
- OpenRouter for AI capabilities