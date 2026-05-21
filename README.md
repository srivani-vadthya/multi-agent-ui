# Multi-Agents UI

A modern, responsive user interface built with TypeScript, React, and Tailwind CSS. This project uses TanStack (React Router, React Query, React Start) for a robust full-stack experience.

## 📋 Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
- [Building for Production](#building-for-production)
- [Code Quality](#code-quality)
- [Dependencies Overview](#dependencies-overview)
- [Contributing](#contributing)
- [License](#license)

## About

Multi-Agents UI is a TypeScript-based React application featuring a comprehensive component library built with Radix UI and styled with Tailwind CSS. This project is designed to showcase modern UI patterns and best practices for building scalable, maintainable web applications.

**Key Features:**
- 📱 Responsive design with Tailwind CSS
- 🎨 Rich component library using Radix UI
- 🚀 TanStack Router for client-side routing
- 📊 Data fetching with React Query
- 📝 Form handling with React Hook Form
- 💅 Modern animations with Framer Motion
- 🔤 TypeScript for type safety
- ✨ Beautiful UI components and utilities

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Language** | TypeScript (96.2%) |
| **Framework** | React 19 |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | TanStack Router |
| **State Management** | Zustand |
| **Form Handling** | React Hook Form + Zod |
| **UI Components** | Radix UI |
| **Data Fetching** | React Query |
| **Code Quality** | ESLint + Prettier |
| **Styling** | CSS (3.3%), JavaScript (0.5%) |

## Prerequisites

Before setting up this project, ensure you have the following installed on your machine:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn** (v3.0.0 or higher) or **pnpm** (v8.0.0 or higher)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installation

```bash
node --version    # Should be v18+
npm --version     # Should be v9+
git --version     # Should be installed
```

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/srivani-vadthya/multi-agents-ui.git
cd multi-agents-ui
```

### Step 2: Install Dependencies

Choose one of the following package managers:

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

**Using pnpm:**
```bash
pnpm install
```

### Step 3: Verify Installation

To ensure everything is set up correctly, run:

```bash
npm run lint
```

This should complete without major errors.

## Project Structure

```
multi-agents-ui/
├── src/
│   ├── components/       # Reusable React components
│   ├── routes/           # TanStack Router route definitions
│   ├── lib/              # Utility functions and helpers
│   ├── styles/           # Global styles and Tailwind config
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── node_modules/         # Project dependencies
├── package.json          # Project metadata and dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── eslint.config.js      # ESLint rules configuration
└── README.md            # This file
```

## Available Scripts

### Development

```bash
npm run dev
```

Starts the development server with hot module replacement (HMR). The application will typically be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

Creates an optimized production build. Output files are generated in the `dist/` directory.

### Build (Development Mode)

```bash
npm run build:dev
```

Creates a build with development settings enabled, useful for debugging.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing before deployment. Useful to verify that everything works as expected in production mode.

### Linting

```bash
npm run lint
```

Analyzes code for potential errors and style issues using ESLint. Displays warnings and errors that should be fixed.

### Format Code

```bash
npm run format
```

Automatically formats all code files according to Prettier configuration. This ensures consistent code style across the project.

## Development Workflow

### 1. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to the local development URL (usually `http://localhost:5173`).

### 2. Make Changes

- Edit files in the `src/` directory
- Changes will automatically reload in the browser thanks to Vite's HMR
- TypeScript will provide real-time type checking

### 3. Check Code Quality

Before committing, always run:

```bash
npm run lint
npm run format
```

### 4. Test Your Changes

Thoroughly test your changes in the browser:
- Test on different screen sizes (responsive design)
- Test interactive components
- Test form submissions
- Test routing

## Building for Production

### Step 1: Create Production Build

```bash
npm run build
```

This generates optimized files in the `dist/` directory.

### Step 2: Preview the Build

```bash
npm run preview
```

Test the production build locally to ensure everything works correctly.

### Step 3: Deploy

Deploy the `dist/` directory to your hosting platform:
- **Cloudflare Pages** - Recommended (has built-in Vite support)
- **Vercel**
- **Netlify**
- **GitHub Pages**
- **Traditional hosting** (copy files to web server)

## Code Quality

This project maintains high code quality standards:

### ESLint

ESLint configuration enforces:
- React best practices
- React hooks rules
- Code consistency
- Error prevention

### Prettier

Prettier automatically formats:
- Code indentation
- Quote style
- Trailing commas
- Line length

### TypeScript

TypeScript ensures:
- Type safety
- Better IDE autocomplete
- Early error detection
- Self-documenting code

**Run quality checks:**
```bash
npm run lint
npm run format
```

## Dependencies Overview

### Core Dependencies

- **React 19** - UI library for building components
- **React DOM 19** - DOM rendering for React
- **Vite** - Lightning-fast build tool
- **TanStack Start** - Full-stack framework
- **TanStack Router** - Client-side routing
- **TanStack React Query** - Data fetching and caching
- **Zustand** - Lightweight state management

### UI & Styling

- **Radix UI** - Accessible, unstyled component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library
- **Class Variance Authority** - Component style variants

### Forms & Validation

- **React Hook Form** - Performant, flexible form library
- **Zod** - TypeScript schema validation
- **@hookform/resolvers** - Form validation resolvers

### Utilities

- **date-fns** - Date manipulation utilities
- **react-markdown** - Markdown rendering
- **remark-gfm** - GitHub-flavored markdown support
- **Recharts** - React charts library
- **input-otp** - OTP input component
- **react-resizable-panels** - Resizable panel system
- **Embla Carousel** - Carousel component
- **Vaul** - Drawer component

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically use the next available port.

### Node Modules Issues

If you encounter issues with node_modules:

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors

Ensure your TypeScript version matches the project requirement:

```bash
npm list typescript
```

### Hot Module Replacement Not Working

Try restarting the development server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Performance Tips

- Use React Developer Tools browser extension for debugging
- Utilize React Query's DevTools in development
- Check network tab in browser DevTools for slow requests
- Use Lighthouse for performance auditing

## Next Steps

1. ✅ Clone and install the project
2. 📚 Explore the component library in `src/components/`
3. 🧪 Review example routes in `src/routes/`
4. 🎨 Customize Tailwind configuration in `tailwind.config.ts`
5. 🔧 Add your own components and pages

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and ensure code quality (`npm run lint && npm run format`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for similar problems
- Provide detailed reproduction steps

## License

This project is open source and available under the MIT License.

---

**Happy coding! 🚀**

*Last updated: May 21, 2026*
