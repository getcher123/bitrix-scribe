# Bitrix Docs Search

AI-powered search for Bitrix documentation with answer generation.

## Features

- **Answer modes** - auto/LLM/extractive/search-only
- **Query history** - save and reuse previous searches
- **Answer rating** - 5-star rating with optional comments
- **Configurable API** - flexible endpoint settings
- **Sources** - direct links to documentation with a configurable prefix

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - fast builds
- **Tailwind CSS** - styling
- **shadcn/ui** - UI components
- **TanStack Query** - server state management

## Installation

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Settings

The settings panel includes:

| Parameter | Description | Default |
|----------|-------------|---------|
| API URL | Base API URL | `http://localhost:8000` |
| Timeout | Request timeout | `30000ms` |
| Default mode | auto / llm / extractive / search | `auto` |
| Show timings | Request timing info | `true` |
| Source prefix | Link prefix for sources | GitHub URL |

## API Endpoints

The app uses the following endpoints:

- `POST /answer` - get an answer
- `POST /search` - search the docs
- `GET /health` - service status
- `GET /history` - query history

## Project Structure

```
src/
|-- components/        # Search, settings, status, UI components
|-- contexts/          # React contexts
|-- hooks/             # Custom hooks
|-- pages/             # Pages
|-- services/          # API services
`-- types/             # TypeScript types
```

## UI Features

- **Dark/Light theme** - automatic detection
- **Responsive layout** - works on mobile devices
- **Animations** - smooth transitions and states

## Answer Rating

Users can rate each answer:
- Rating from 1 to 5 stars
- Optional comment for low ratings
- Data stored locally

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # Lint
npm run test     # Unit tests (Vitest)
npm run test:e2e # E2E tests (Playwright)
npm run gen:api  # Generate types from openapi.yaml
```

Before running e2e tests for the first time:

```bash
npx playwright install
```

## License

MIT
