# SpendSmart - Premium Personal Finance Dashboard (Frontend)

SpendSmart is a modern, high-performance financial management interface built with **Angular 17+**. It combines a premium, fintech-native user experience with a powerful, distributed backend to provide users with deep insights into their financial health.

**Live Production URL**: [http://13.48.183.110.sslip.io](http://13.48.183.110.sslip.io)

---

## 🎨 Premium UI/UX & Design Philosophy

SpendSmart is designed to feel like a high-end banking application. We prioritize **Aesthetics**, **Speed**, and **Responsiveness**.

- **Modern Glassmorphism**: The UI uses subtle transparency and blur effects to create a deep, layered look that feels state-of-the-art.
- **The Signature "Health Glow"**: Our Financial Health Score card features a **Premium Blue Glow Effect**. This isn't just for looks—the intensity of the glow and the color adapt to your financial score, giving you an instant, intuitive feel for your budget status.
- **Mobile-First Responsive Design**: Built with **Tailwind CSS**, the entire dashboard scales perfectly from a 27-inch 4K monitor down to a 5-inch smartphone.
- **Dark/Light Mode**: A seamless, persistent theme toggle that respects your eyes and your device settings, with smooth CSS transitions between modes.

---

## 🚀 Key Feature Deep-Dive

### 1. Intelligent Financial Dashboard
The central hub of the application. It aggregates data from all microservices to give you a "birds-eye view" of your money.
- **Real-Time Cashflow**: Visualizes your income vs. expenses for the current month using interactive **Chart.js** charts.
- **Category Breakdowns**: Instantly see which categories (like Food or Shopping) are eating up your budget.

### 2. The Financial Health Coach
This is the "brain" of the dashboard.
- **Smart Scoring**: We don't just show you numbers; we give you a grade from 0 to 100 based on complex algorithms running in our `analytics-service`.
- **Actionable Insights**: If your score is low, the dashboard tells you *why* and gives you tips on how to improve your savings rate or budget adherence.

### 3. Automated Automation Management
- **Recurring Schedules**: View and manage all your automated bills and incomes.
- **Safety Logic**: The UI communicates with the `recurring-service` to ensure that when you're setting up a new monthly bill, you don't accidentally log the first month twice.

### 4. Advanced Notification Center
A real-time communication hub.
- **Instant Alerts**: Receive immediate feedback when you hit 80% of a category budget or when a recurring bill is processed.
- **Payment Receipts**: Successful "Pro" upgrades trigger a real-time, in-app receipt notification that is saved permanently to your history.

### 5. SpendSmart Pro & Razorpay
- **One-Click Upgrade**: A seamless integration with the **Razorpay Payment Gateway**.
- **Premium Features**: Unlocks momentum forecasting (predicting where you'll be at the end of the month) and professional PDF financial reports.

---

## 🛠️ Technical Architecture (Under the Hood)

SpendSmart uses the latest Angular features to ensure the UI is fast and the code is maintainable.

- **Angular 17+ (Standalone Components)**: We've moved away from bulky modules. Every component is self-contained, leading to smaller bundle sizes and faster load times.
- **Angular Signals**: The next generation of state management. Signals ensure that when your data changes, only the *exact* part of the UI that needs it is updated. No unnecessary re-renders!
- **RxJS Reactive Streams**: We treat data like a river. Whether it's a notification coming in via WebSocket or a budget update, RxJS ensures the data flows smoothly to the UI.
- **Interceptor Architecture**: A centralized "Security Guard" that intercepts every outgoing HTTP request to automatically attach your JWT token and handle errors gracefully.
- **Route Guards**: Sophisticated access control that protects routes based on authentication status, user roles (Admin/User), and subscription plans (Basic/Pro).

---

## 📁 Feature-Based Project Structure

The codebase is organized logically so it's easy to scale:

```text
src/app/
├── core/                   # The "Backbone": Auth services, JWT interceptors, and Global Guards.
├── features/               # The "Organs": Individual modules for each major feature.
│   ├── admin/              # User management and platform-wide analytics for admins.
│   ├── analytics/          # Heavy-duty reporting and financial forecasting.
│   ├── auth/               # Identity: Login, Register, Password Reset, OAuth.
│   ├── budget/             # Tools for setting and tracking expenditure limits.
│   ├── dashboard/          # The main landing page and the Health Glow card.
│   ├── notifications/      # Real-time alert center and communication history.
│   └── subscriptions/      # The Razorpay payment flow and plan management.
└── shared/                 # The "Tools": Reusable UI components like Modals, Toasts, and Navbars.
```

---

## 📦 Professional CI/CD & Deployment

We use a fully automated pipeline to ensure the dashboard is always live and bug-free.

- **GitHub Actions Integration**: Every push to the main branch triggers an automated build and test sequence.
- **Dockerized Multi-Stage Builds**:
    - **Stage 1 (Build)**: Uses a Node environment to compile and optimize the Angular code.
    - **Stage 2 (Serve)**: Uses an **Nginx** server to serve the production-ready files. Nginx is pre-configured to handle SPA routing (the "404 to index.html" problem) and provide Gzip compression for faster loading.
- **Auto-Sync to EC2**: The Docker image is pushed to Docker Hub and pulled onto our AWS EC2 production server instantly.

---

## 💻 Getting Started Locally

1. **Clone & Navigate**: `cd spendsmart-frontend`.
2. **Install**: `npm install --legacy-peer-deps` (to handle ng2-charts peer requirements).
3. **Configure**: Update `src/environments/environment.ts` with your API Gateway URL.
4. **Launch**: `ng serve`.

---

**SpendSmart: A Premium Experience for Your Personal Finances.** 🟢🚀💎
