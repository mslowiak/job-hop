# JobHop

[![Astro](https://img.shields.io/badge/Astro-5-blue)](https://astro.build/) [![React](https://img.shields.io/badge/React-19-green)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-purple)](https://tailwindcss.com/)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

JobHop is a web application designed to help active job seekers centralize, manage, and track the status of their job applications. The MVP (Minimum Viable Product) aims to replace fragmented methods like spreadsheets, notebooks, and browser tabs with a simple, transparent tool. Users can manually submit applications, monitor their status on a dashboard, and analyze basic recruitment statistics.

### Key Features

- **Authentication & Account Management**: Email/password signup and login with JWT tokens, account settings (change password, delete account), and secure logout.
- **Job Applications Management (CRUD)**: Add, view, edit, and delete applications with fields like Company Name, Position, Application Date (required), Job Link, Notes, and Status (predefined options: Planned to Send, Sent, In Progress, Interview, Rejected, Offer; default: Sent).
- **Dashboard**: Main view showing a sortable list of applications (newest first) with quick status updates via dropdown, filtering by status, and an empty state for new users with a call-to-action to add the first application.
- **Statistics Page**: Simple textual counts of applications per status.
- **Navigation & UI**: Responsive header with links to Dashboard and Stats, user profile menu (Settings, Logout), and a persistent feedback link to a Google Form.
- Fully responsive design for mobile and desktop.

The app addresses the chaos of tracking multiple applications, providing a single source of truth without advanced integrations in the MVP.

## Tech Stack

### Frontend

- **Astro 5**: For building fast, content-focused websites with minimal JavaScript.
- **React 19**: For interactive components where dynamic behavior is needed.
- **TypeScript 5**: For static type checking and improved developer experience.
- **Tailwind CSS 4**: Utility-first CSS framework for rapid styling.
- **Shadcn/ui**: Accessible React UI components built on Tailwind and Radix UI.

### Backend

- **Supabase**: Open-source Backend-as-a-Service providing PostgreSQL database, authentication, and SDKs. Self-hostable with built-in user auth.

### AI Integration

- **Openrouter.ai**: Gateway to various AI models (e.g., OpenAI, Anthropic, Google) with API key management and cost limits. (Used for future enhancements beyond MVP.)

### CI/CD & Hosting

- **GitHub Actions**: For automated CI/CD pipelines.
- **DigitalOcean**: Hosting via Docker containers.

## Getting Started Locally

### Prerequisites

- Node.js version 22.14.0 (use [nvm](https://github.com/nvm-sh/nvm) to manage versions: `nvm use` after installing).
- A Supabase setup:
  - non local: account and project (free tier available at [supabase.com](https://supabase.com)). This provides the database and authentication backend.
  - local: [Supabase CLI](https://supabase.com/docs/guides/cli) for local development. (`sudo npx supabase start -x vector`)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/mslowiak/job-hop.git
   cd job-hop
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add your Supabase credentials (obtained from your Supabase project dashboard):
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - For production, add `SUPABASE_SERVICE_ROLE_KEY` if needed for admin operations.
4. Create necessary database tables in Supabase:
   - Users (handled by Supabase Auth).
   - Applications table with columns: id (UUID), user_id (UUID, foreign key to auth.users), company_name (text, required), position (text, required), application_date (date, required), job_link (text, optional), notes (text, optional), status (text, enum: ['planned', 'sent', 'in_progress', 'interview', 'rejected', 'offer'], default 'sent'), created_at (timestamp).
   - Enable Row Level Security (RLS) policies to restrict access to user-owned data.
5. Run the development server:
   ```
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

For production builds, refer to the [Astro documentation](https://docs.astro.build/en/guides/deploy/).

## Available Scripts

In the project root, you can run:

- `npm run dev`: Start the development server with hot reloading.
- `npm run build`: Build the project for production (outputs to `dist/`).
- `npm run preview`: Preview the production build locally.
- `npm run astro`: Run Astro CLI commands (e.g., `npm run astro check` for type-checking).
- `npm run lint`: Run ESLint to check for code issues.
- `npm run lint:fix`: Run ESLint and fix auto-fixable issues.
- `npm run format`: Run Prettier to format code.

Linting and formatting are enforced via Husky pre-commit hooks.

## Project Scope

### MVP Features

- User authentication and account management (signup, login, logout, password change, account deletion).
- Full CRUD for job applications with required validations and predefined statuses.
- Dashboard with listing, sorting, filtering, quick status updates, and empty state.
- Statistics overview by status.
- Responsive navigation and UI with feedback collection.
- Basic error handling and user-friendly messages.

### Out of Scope for MVP

- Automatic imports from emails or job portals (e.g., LinkedIn, Pracuj.pl).
- Calendar integrations (e.g., Google Calendar for interview scheduling).
- Reminders and notifications (e.g., follow-ups).
- Document storage/versioning (e.g., CVs, cover letters).
- Native mobile apps.
- Password reset via email.
- AI-powered features (e.g., CV matching, email generation).

Future enhancements may include these based on user feedback. Success metrics focus on engagement (50% users add 3+ apps in first week), retention (20% weekly active users), and feedback collection (10+ opinions via Google Form).

For detailed user stories and acceptance criteria, see the [Product Requirements Document (PRD)](.ai/prd.md).

## Project Status

This project is in active development as an MVP based on an Astro starter template. The frontend structure is set up, with core dependencies installed. Authentication and basic CRUD operations are planned next, followed by dashboard and stats implementation. The repository is ahead of the remote by 5 commits. Contributions are welcome—see the PRD for priorities.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. (Note: If no LICENSE file exists, create one with standard MIT terms.)
