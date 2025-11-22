# Campaignify - CRM Platform

A modern CRM platform that enables customer segmentation, personalized campaign delivery, and intelligent insights.

## Features

- 🔐 Secure Google OAuth 2.0 Authentication
- 📊 Customer Data Management
- 🎯 Dynamic Campaign Creation
- 🎨 Intuitive Rule Builder UI
- 📈 Campaign Analytics
- 🤖 AI-Powered Features
  - Natural Language to Segment Rules
  - AI-Driven Message Suggestions
  - Campaign Performance Summarization
  - Smart Scheduling Suggestions

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Headless UI
- **State Management**: React Context + Hooks
- **API Integration**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/campaignify-xenocrm.git
cd campaignify-xenocrm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in the required environment variables in `.env.local`

4. Initialize the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
├── prisma/            # Database schema and migrations
├── types/             # TypeScript type definitions
└── api/               # API routes and handlers
```

## API Documentation

### Data Ingestion APIs

- `POST /api/customers` - Ingest customer data
- `POST /api/orders` - Ingest order data

### Campaign Management APIs

- `POST /api/campaigns` - Create a new campaign
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns/:id/send` - Send campaign

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
