# StageAsset

**StageAsset** is a modern SaaS platform that streamlines the process of collecting speaker assets (photos, bios, presentations, etc.) for events. Event organizers can create events, invite speakers, define asset requirements, and manage submissions—all in one centralized dashboard.

## Features

### For Event Organizers
- **Event Management**: Create and manage multiple events with custom branding (colors, logos)
- **Speaker Invitations**: Send email invitations to speakers with personalized links
- **Asset Requirements**: Define custom asset types (photos, bios, presentations, etc.) with specific requirements
- **Automated Reminders**: Configure automatic email reminders for speakers before submission deadlines
- **Submission Tracking**: Monitor submission status across all speakers in real-time
- **Activity Logs**: Track all system activities and user actions
- **Subscription Plans**: Multiple pricing tiers with feature limits

### For Speakers
- **Dedicated Portal**: Access events via unique invitation links
- **Asset Submission**: Upload required assets with drag-and-drop support
- **Submission Status**: View submission progress and missing requirements
- **Brand Experience**: Event-specific branding (colors, logos) in the speaker portal

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **React Router v7** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Framer Motion** - Animations
- **date-fns** - Date utilities

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Backend API** running (see backend repository)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stageasset-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Modal, etc.)
│   ├── Modal.tsx       # Modal wrapper component
│   ├── ImageUpload.tsx # File upload component
│   └── ...
├── pages/              # Route pages
│   ├── auth/           # Authentication pages
│   ├── events/         # Event management pages
│   ├── portal/         # Speaker portal pages
│   └── ...
├── services/           # API service layer
│   ├── auth.service.ts
│   ├── events.service.ts
│   ├── speakers.service.ts
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx
│   └── ...
├── lib/                # Utilities and configurations
│   ├── axios.ts        # Axios instance
│   ├── queryClient.ts  # React Query config
│   └── utils.ts        # Helper functions
├── schemas/            # Zod validation schemas
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## Key Features Implementation

### Authentication
- JWT-based authentication with token storage
- Protected routes with authentication guards
- Auto-refresh on token expiration

### File Uploads
- Drag-and-drop file upload with react-dropzone
- File size validation
- Image preview
- Multiple file types support

### Form Handling
- React Hook Form with Zod validation
- Real-time error feedback
- Optimistic UI updates

### State Management
- React Query for server state (caching, invalidation, refetching)
- React Context for auth state
- Local state with useState/useReducer

### Styling
- Tailwind CSS with custom configuration
- Responsive design (mobile-first)
- Dark overlays and modal animations
- Custom color theming per event

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## API Integration

The application expects the backend API to be available at the URL specified in `VITE_API_URL`. All API calls are made through service modules in `src/services/`.

### API Endpoints Used
- `/auth/*` - Authentication
- `/events/*` - Event management
- `/speakers/*` - Speaker invitations
- `/asset-requirements/*` - Asset requirements
- `/submissions/*` - Asset submissions
- `/portal/*` - Speaker portal
- `/activity-logs/*` - Activity tracking
- `/subscription-plans/*` - Subscription management

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Build to ensure no errors: `npm run build`
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and feature requests, please create an issue in the repository.
