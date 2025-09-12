# AI Processing Setup Guide

This guide explains how to set up and configure AI processing capabilities for the M365 Agent Insights project.

## Installed Packages

The following AI and NLP packages have been installed:

- **openai** (^5.20.1) - OpenAI API client for GPT models
- **compromise** (^14.14.4) - Natural language processing for entity extraction
- **sentiment** (^5.0.2) - Sentiment analysis library
- **natural** (^8.1.0) - Natural language processing toolkit
- **@types/natural** (^5.1.5) - TypeScript definitions for natural

## Environment Configuration

### Required Setup

1. **Create Environment File**
   ```bash
   cp .env.example .env.local
   ```

2. **Get OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign in or create an account
   - Create a new API key
   - Copy the key to your `.env.local` file

3. **Configure Environment Variables**
   ```env
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional (with defaults)
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_MAX_TOKENS=2000
   OPENAI_TEMPERATURE=0.7
   
   # Feature toggles
   SENTIMENT_ANALYSIS_ENABLED=true
   TOPIC_EXTRACTION_ENABLED=true
   LANGUAGE_DETECTION_ENABLED=true
   AI_INSIGHTS_ENABLED=true
   AI_SUMMARY_ENABLED=true
   AI_RECOMMENDATIONS_ENABLED=true
   ```

## New AI Services

### Enhanced AI Processing (`services/ai-enhanced.ts`)

Provides advanced AI capabilities including:

- **Text Analysis**: Sentiment analysis, entity extraction, topic detection
- **AI Insights**: Intelligent insights generation from emails and calendar events
- **Natural Language Processing**: Keyword extraction, language detection, readability analysis
- **OpenAI Integration**: AI-powered summarization and content analysis

### AI Configuration (`lib/ai-config.ts`)

Centralized configuration management for:

- Environment variable handling
- Configuration validation
- Default value management
- Setup instructions

### Updated AI Insights (`services/ai-insights.ts`)

Enhanced with:

- Integration with new AI capabilities
- Fallback to basic insights when AI is unavailable
- Async insight generation support

## Usage Examples

### Basic Text Analysis
```typescript
import { analyzeText } from '@/services/ai-enhanced';

const analysis = await analyzeText("This is a sample email content");
console.log(analysis.sentiment);
console.log(analysis.entities);
console.log(analysis.summary);
```

### Enhanced Insights Generation
```typescript
import { generateEnhancedInsights } from '@/services/ai-insights';

const insights = await generateEnhancedInsights(emails, events);
// Returns AI-powered insights with fallback to basic insights
```

### Configuration Validation
```typescript
import { getAIConfig, validateAIConfig } from '@/lib/ai-config';

const config = getAIConfig();
const validation = validateAIConfig(config);

if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Features

### Sentiment Analysis
- Detects positive, negative, and neutral sentiment
- Provides confidence scores
- Identifies emotional keywords

### Entity Extraction
- Extracts people, organizations, and topics
- Uses compromise library for natural language processing
- Identifies key entities in communications

### AI-Powered Summarization
- Uses OpenAI GPT models for intelligent summarization
- Falls back to extractive summarization when AI unavailable
- Maintains context and key information

### Intelligent Insights
- Generates actionable insights from email and calendar data
- Prioritizes insights by urgency and importance
- Provides suggested actions for each insight

### Topic Detection
- Identifies communication topics (finance, meetings, projects, etc.)
- Keyword extraction and analysis
- Context-aware topic classification

## Security Considerations

- Never commit `.env.local` files to version control
- Keep API keys secure and rotate regularly
- Use environment-specific keys for production
- Monitor API usage and costs

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the key is correctly set in `.env.local`
   - Check OpenAI account status and billing
   - Ensure the key has proper permissions

2. **AI Features Not Working**
   - Check configuration validation: `validateAIConfig(getAIConfig())`
   - Verify environment variables are loaded
   - Check console for error messages

3. **Package Installation Issues**
   - Run `npm install --legacy-peer-deps` if encountering dependency conflicts
   - Clear node_modules and package-lock.json if needed

### Fallback Behavior

The system is designed to gracefully degrade:
- If OpenAI is unavailable, falls back to basic insights
- If sentiment analysis fails, provides neutral sentiment
- If entity extraction fails, returns empty arrays
- Always provides some level of functionality

## Next Steps

1. Set up your OpenAI API key
2. Test the AI features in development
3. Configure production environment variables
4. Monitor API usage and costs
5. Customize AI prompts and parameters as needed

For more information, see the individual service files and their documentation.
