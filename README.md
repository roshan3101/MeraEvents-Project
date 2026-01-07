# Event & Attendee Management Portal

A full-stack dashboard application for managing events and their attendee registrations. Built with Next.js, Prisma, and TanStack Query, featuring a modern UI with dark mode support.

## 🚀 Features

### Core Functionality
- **Event Management**
  - Create, read, update, and delete events
  - Event details: Title, Date, Description, and Capacity
  - View all events with search and filtering
  - Visual indicators for past events and full capacity events

- **Attendee Management**
  - Register attendees for events
  - View attendees by event
  - Update and delete attendee registrations
  - Capacity validation and duplicate email prevention
  - Search attendees by name or email

### Advanced Features
- **State Management**
  - TanStack Query for server-state synchronization
  - Optimistic UI updates for instant feedback
  - Automatic cache invalidation and refetching

- **User Experience**
  - Dark mode support with theme toggle
  - Loading skeletons for better perceived performance
  - Empty states with actionable buttons
  - Error boundaries with retry functionality
  - Toast notifications for user feedback
  - Responsive design for all screen sizes

- **Form Validation**
  - React Hook Form for form management
  - Zod schema validation
  - Client and server-side validation
  - Comprehensive error messages

- **Navigation**
  - Sidebar navigation with collapsible menu
  - Separate pages for Events and Attendees
  - Dashboard with statistics overview
  - Quick action buttons

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - UI component library
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **next-themes** - Dark mode support
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 7.2.0** - ORM and database toolkit
- **PostgreSQL** - Database
- **@prisma/adapter-pg** - PostgreSQL adapter for Prisma

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd event-attendance-portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

Replace with your PostgreSQL connection string.

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
event-attendance-portal/
├── app/
│   ├── api/
│   │   ├── events/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # PUT, DELETE events
│   │   │   └── route.ts          # GET, POST events
│   │   └── attendees/
│   │       ├── [id]/
│   │       │   └── route.ts      # PUT, DELETE attendees
│   │       └── route.ts           # GET, POST attendees
│   ├── events/
│   │   ├── [id]/
│   │   │   └── edit/
│   │   │       └── page.tsx      # Edit event page
│   │   ├── new/
│   │   │   └── page.tsx          # Create event page
│   │   └── page.tsx              # Events list page
│   ├── attendees/
│   │   ├── [id]/
│   │   │   └── edit/
│   │   │       └── page.tsx      # Edit attendee page
│   │   ├── new/
│   │   │   └── page.tsx          # Register attendee page
│   │   └── page.tsx              # Attendees list page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard page
│   └── providers.tsx             # React Query & Theme providers
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── app-sidebar.tsx           # Sidebar navigation
│   ├── attendee-form.tsx         # Attendee form component
│   ├── attendee-list.tsx         # Attendee list component
│   ├── error-boundary.tsx        # Error boundary component
│   ├── error-retry.tsx           # Error retry component
│   ├── event-form.tsx            # Event form component
│   ├── event-list.tsx            # Event list component
│   ├── event-search.tsx          # Event search component
│   ├── sidebar-provider.tsx      # Sidebar provider wrapper
│   └── theme-toggle.tsx          # Theme toggle component
├── lib/
│   ├── date-utils.ts             # Date formatting utilities
│   ├── prisma.ts                 # Prisma client instance
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # Utility functions
│   └── validations.ts            # Zod validation schemas
├── prisma/
│   ├── migrations/               # Database migrations
│   └── schema.prisma             # Prisma schema
└── public/                       # Static assets
```

## 🗄️ Database Schema

### Event Model
```prisma
model Event {
  id          Int       @id @default(autoincrement())
  title       String
  date        DateTime
  description String
  capacity    Int
  attendees   Attendee[]
}
```

### Attendee Model
```prisma
model Attendee {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  eventId  Int
  event    Event  @relation(fields: [eventId], references: [id])
}
```

## 🔌 API Endpoints

### Events

- `GET /api/events` - Get all events with attendees
- `POST /api/events` - Create a new event
- `PUT /api/events/[id]` - Update an event
- `DELETE /api/events/[id]` - Delete an event (cascades to attendees)

### Attendees

- `GET /api/attendees?eventId={id}` - Get attendees for a specific event
- `POST /api/attendees` - Register a new attendee
- `PUT /api/attendees/[id]` - Update an attendee
- `DELETE /api/attendees/[id]` - Delete an attendee

## 🎯 Usage

### Creating an Event

1. Navigate to **Events** from the sidebar
2. Click **New Event** button
3. Fill in the form:
   - Title (required, max 200 characters)
   - Date (required, must be a future date)
   - Description (required, max 1000 characters)
   - Capacity (required, positive integer)
4. Click **Create Event**

### Registering an Attendee

1. Navigate to **Attendees** from the sidebar
2. Click **Register** button
3. Select an event from the dropdown
4. Enter name and email
5. Click **Register**

### Managing Events

- **View Events**: Navigate to Events page to see all events
- **Search Events**: Use the search bar to filter by title or description
- **Edit Event**: Click the edit icon on any event card
- **Delete Event**: Click the delete icon (trash) on any event card

### Managing Attendees

- **View Attendees**: Navigate to Attendees page
- **Select Event**: Choose an event from the dropdown to view its attendees
- **Search Attendees**: Use the search bar to filter by name or email
- **Edit Attendee**: Click the edit icon on any attendee card
- **Delete Attendee**: Click the delete icon on any attendee card

## 🎨 Features in Detail

### Optimistic UI Updates
All mutations (create, update, delete) use optimistic updates for instant feedback. If the operation fails, the UI automatically rolls back to the previous state.

### Error Handling
- Error boundaries catch React errors
- Retry functionality for failed API calls
- User-friendly error messages
- Toast notifications for success/error feedback

### Search & Filter
- Real-time search for events (by title/description)
- Real-time search for attendees (by name/email)
- Memoized filtering for performance

### Date Formatting
Consistent date formatting across the application:
- Formatted date display (e.g., "Mon, Jan 15, 2024")
- Formatted time display (e.g., "02:30 PM")
- Past event indicators
- DateTime-local input formatting

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Semantic HTML structure

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Prisma Studio (Database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Consistent code formatting
- Component-based architecture

## 📝 Key Implementation Details

### State Management
- TanStack Query handles all server state
- Optimistic updates for mutations
- Automatic cache invalidation
- Retry logic with exponential backoff

### Form Validation
- Zod schemas for type-safe validation
- React Hook Form for form state
- Client and server-side validation
- Real-time validation feedback

### Database
- Prisma ORM for type-safe database access
- PostgreSQL adapter for Prisma 7
- Migrations for schema changes
- Relations between Events and Attendees

### UI/UX
- Shadcn/UI components for consistent design
- Dark mode with next-themes
- Responsive layout with Tailwind CSS
- Loading states and skeletons
- Empty states with actions

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Ensure your production environment has:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production`

### Recommended Platforms
- **Vercel** - Optimized for Next.js
- **Netlify** - Easy deployment
- **Railway** - Database included
- **AWS/GCP/Azure** - Self-hosted options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of a coding assignment/assessment.

## 👤 Author

Built as part of a technical assessment demonstrating:
- Full-stack development skills
- Modern React/Next.js patterns
- Database design and ORM usage
- UI/UX best practices
- Code organization and architecture

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- TanStack for excellent state management tools
- Prisma for the developer-friendly ORM

---

**Note**: This project demonstrates a production-ready event management system with comprehensive features, error handling, and user experience optimizations.
