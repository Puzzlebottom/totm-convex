# TOTM Combat Tracker

A Table-Top Role Playing Game (TTRPG) Encounter Builder and Combat Tracker built with **Convex** to demonstrate the power of the Convex Sync Engine for real-time collaborative applications.

## Features

- **Real-time Sync**: All changes sync instantly across all connected clients
- **Theatre of the Mind**: Streamlined interface optimized for narrative combat (not VTT)
- **Character & Monster Management**: Create characters and reusable monster templates
- **Convex Auth Integration**: Secure user authentication and data isolation

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A Convex account (sign up at [convex.dev](https://convex.dev))

### Environment Variables

This project uses Convex Auth and requires the following environment variables to be set:

1. **CONVEX_DEPLOYMENT** - Your Convex deployment URL (automatically set by `npx convex dev`)
2. **CONVEX_SITE_URL** - Your application's site URL (e.g., `http://localhost:5173` for development)

The setup script (`setup.mjs`) will automatically configure these variables when you run `npx convex dev` for the first time.

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd totm-convex
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Convex**

   ```bash
   npx convex dev
   ```

   This will:
   - Initialize your Convex project
   - Set up the database schema
   - Start the development server
   - Open the Convex dashboard

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

## Architecture

This project demonstrates Convex Sync Engine capabilities:

- **Reactive Queries**: UI automatically updates when data changes
- **Real-time Mutations**: Changes propagate instantly to all clients
- **Type Safety**: Generated TypeScript types for all data operations

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend development servers
- `npm run build` - Build the application for production

## Technology Stack

- **Backend**: [Convex](https://convex.dev/) - Real-time database and backend
- **Frontend**: [React 19](https://react.dev/) - UI framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool
- **Styling**: [totm-ui-components](https://github.com/Puzzlebottom/totm-ui-components) - Cross platform component library based on Tamagui
- **Authentication**: [Convex Auth](https://labs.convex.dev/auth) - User management
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type safety

## Learn More

- [Convex Documentation](https://docs.convex.dev/) - Comprehensive Convex guide
- [Convex Sync Engine](https://docs.convex.dev/sync-engine) - Understanding real-time sync
- [Convex Auth](https://labs.convex.dev/auth) - Authentication with Convex
- [React Documentation](https://react.dev/) - React framework guide

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

---

**Built with Convex Sync Engine**
