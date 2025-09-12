# M365 Agent Insights

A Next.js application that provides AI-powered insights for financial advisors using Microsoft 365 data integration.

## Features

- 🤖 **AI-Powered Analysis**: Advanced AI processing with OpenAI, local NLP, and mock modes
- 📧 **Outlook Integration**: Mock email interface with sample client data
- 🎯 **Client Insights**: AI-generated insights for financial advisor client relationships
- 🔄 **Hybrid AI System**: Three-tier processing (OpenAI, Local NLP, Mock) with fallback mechanisms
- 🎨 **Modern UI**: Fluent UI components for authentic Microsoft 365 experience

## Demo Mode

For demonstrations and testing, you can bypass authentication:

1. Create a `.env.local` file in the project root
2. Add the following line:
   ```
   NEXT_PUBLIC_BYPASS_AUTH=true
   ```
3. Run the application - it will load directly to the mock Outlook interface

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
