# SpendSmart - Personal Finance Dashboard (Frontend)

SpendSmart is a modern, high-performance personal finance management application built with Angular. It provides users with a comprehensive suite of tools to track expenses, manage budgets, automate recurring transactions, and gain actionable insights into their financial health.

## 🚀 Features

- **Dashboard & Analytics**: Interactive charts and visualizations (using `ng2-charts` and `Chart.js`) providing a holistic view of your finances.
- **Income & Expense Tracking**: Easy-to-use forms for logging transactions with categorization.
- **Budget Management**: Set monthly budgets by category with real-time progress bars and alerts when approaching limits.
- **Recurring Transactions**: Automate your regular bills and incomes. Includes a built-in calendar view to anticipate upcoming automated transactions.
- **Real-Time Notifications**: Stay updated on budget thresholds, upcoming recurring bills, and system events via a notification bell and center.
- **Authentication & Security**: Secure JWT-based authentication, including standard email/password login, OAuth integration (Google/GitHub), and role-based access control (Admin vs User).
- **Premium Subscriptions**: Integration with Razorpay for handling "SpendSmart Pro" subscriptions, unlocking advanced analytics and features.
- **Modern UI/UX**: Fully responsive, mobile-first design built with Tailwind CSS. Includes a seamless Dark/Light mode toggle and premium glassmorphic elements.

## 🛠️ Technology Stack

- **Framework**: [Angular](https://angular.dev/) (Standalone Components Architecture)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: RxJS & Angular Signals
- **Charting**: `ng2-charts` & `Chart.js`
- **Routing**: Angular Router with Route Guards (`AuthGuard`, `RoleGuard`, `PremiumGuard`)
- **HTTP**: `HttpClient` with Interceptors for JWT attachment and error handling
- **Testing**: Jasmine & Karma (Configured with Code Coverage reporting)

## 📁 Project Structure

The application follows a modular, feature-based architecture for scalability and maintainability:

```text
src/app/
├── core/                   # Singleton services, interceptors, guards, and models
│   ├── interceptors/       # API and JWT interceptors
│   ├── guards/             # Route protection guards
│   └── services/           # Global singleton services (Auth, Theme, Toast, etc.)
├── features/               # Feature modules (Lazy-loaded routes)
│   ├── admin/              # Admin dashboard and user management
│   ├── analytics/          # Advanced reporting and charts
│   ├── auth/               # Login, Register, Password Reset, OAuth
│   ├── budget/             # Budget forms, lists, and progress tracking
│   ├── category/           # Category management
│   ├── dashboard/          # Main user dashboard
│   ├── expense/            # Expense tracking
│   ├── income/             # Income tracking
│   ├── notifications/      # Notification center
│   ├── profile/            # User profile settings
│   ├── recurring/          # Recurring transaction lists and calendar
│   └── subscriptions/      # Razorpay checkout and pricing plans
└── shared/                 # Reusable UI components, directives, and pipes
    ├── components/         # Layouts, Navbar, Modals, Toasts, Theme Toggles
    └── utils/              # Helper functions (Date, Forms, File Download)
```

## 💻 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [Angular CLI](https://angular.dev/tools/cli) installed globally (`npm install -g @angular/cli`)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd spendsmart-frontend
   ```

2. Install dependencies:
   *(Note: If you encounter peer dependency issues with ng2-charts, use the legacy-peer-deps flag)*
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure Environment:
   Ensure your `src/environments/environment.ts` and `src/environments/environment.development.ts` are correctly pointing to the backend API Gateway (typically `http://localhost:8080/api` or `http://localhost:8080`).

### Development Server

Run the application locally:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## 🧪 Testing and Code Quality

### Unit Tests
The project uses Karma and Jasmine for unit testing. To run the test suite:

```bash
ng test
```

### Code Coverage
To run tests and generate a code coverage report (`lcov.info`):

```bash
npm run test:coverage
```
*Coverage reports are output to `coverage/spendsmart-frontend/` and can be analyzed by SonarQube using the provided `run-full-analysis.bat` script in the root directory.*

## 📦 Building for Production

To compile the application for production deployment:

```bash
ng build
```

This will create an optimized, minified bundle in the `dist/spendsmart-frontend` directory, ready to be served by any static file server (Nginx, Apache, AWS S3, etc.).

## 🎨 Theming

The application supports robust theming powered by Tailwind CSS. The theme service (`ThemeService`) manages the toggling between light and dark modes, persisting the user's preference in `localStorage` and dynamically applying Tailwind's `dark` class to the HTML body.
