# Shift Manager / Менеджер Смен

A mobile-first shift and income tracker for hourly and piece-work jobs with Firebase auth, expense tracking, tips, and detailed statistics.

Мобильное приложение для учета смен и дохода при почасовой и сдельной работе: с Firebase-авторизацией, расходами, чаевыми и подробной статистикой.

![React](https://img.shields.io/badge/React-18-blue)
![Firebase](https://img.shields.io/badge/Firebase-12-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-3-teal)
![Vite](https://img.shields.io/badge/Vite-6-purple)

## Features / Возможности

### Shift Tracking / Учет смен
- Create and edit shifts with automatic handling of overnight work
- Track work duration, breaks, mileage, bonuses, and expenses
- Record cash tips and card tips with deduction support
- Support both hourly pay and piece-work income
- Keep comments and extra details per shift
- Hourly rate is locked per shift at creation time — changing the rate in settings does not affect historical data

### Statistics / Статистика
- Filter by today, this week, this month, or a custom period
- View net income, total time, earnings, tips, mileage, expenses, and bonuses
- See averages per shift and per hour
- Review expense breakdown by category

### Account And Settings / Аккаунт и настройки
- Email/password authentication and Google sign-in
- Languages: Russian, English, Hebrew with RTL support
- Currencies: ILS, USD, EUR, RUB, GBP, UAH
- Theme selection and color palette selection
- Overtime rules, unpaid lunch, and card tips deduction settings
- Toggle individual input fields and statistics cards on or off

## Tech Stack

- React 18
- Vite 6
- Firebase Auth + Firestore
- Tailwind CSS
- Vitest

## Getting Started / Начало работы

### Prerequisites / Требования
- Node.js 18+
- npm
- Firebase project

### Installation / Установка

1. Clone the repository / Клонируйте репозиторий:

```bash
git clone https://github.com/ShvetsIgor/Work-Tracker-Final.git
cd Work-Tracker-Final
```

2. Install dependencies / Установите зависимости:

```bash
npm install
```

3. Create a `.env` file in the project root / Создайте файл `.env` в корне проекта:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

`VITE_FIREBASE_MEASUREMENT_ID` can be left empty if Analytics is not used.

`VITE_FIREBASE_MEASUREMENT_ID` можно оставить пустым, если Firebase Analytics не используется.

4. Set up Firebase / Настройте Firebase:
- Create a Firebase project
- Enable Authentication
- Enable Email/Password sign-in
- Enable Google sign-in if you want Google auth in the app
- Create a Firestore database

5. Add Firestore Security Rules / Добавьте правила безопасности Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Start the development server / Запустите сервер разработки:

```bash
npm run dev
```

## Project Structure / Структура проекта

```text
Work-Tracker-Final/
├── public/
│   ├── icons/
│   ├── apple-touch-icon.svg
│   ├── favicon.svg
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── index.jsx
│   │   │   └── Modal.jsx
│   │   ├── AccountScreen.jsx
│   │   ├── AuthScreen.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   ├── SettingsScreen.jsx
│   │   ├── ShiftModal.jsx
│   │   ├── ShiftsScreen.jsx
│   │   └── StatisticsScreen.jsx
│   ├── config/
│   │   ├── colorPalettes.js
│   │   ├── currencies.js
│   │   ├── defaults.js
│   │   └── firebase.js
│   ├── context/
│   │   └── AppContext.jsx
│   ├── i18n/
│   │   └── translations.js
│   ├── styles/
│   │   └── index.css
│   ├── utils/
│   │   ├── calculations.js
│   │   ├── calculations.test.js
│   │   ├── dateUtils.js
│   │   ├── dateUtils.test.js
│   │   ├── formatters.js
│   │   └── formatters.test.js
│   ├── App.jsx
│   └── main.jsx
├── firebase.json
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.mjs
├── vitest.config.mjs
└── README.md
```

## Main App Flow / Основной сценарий

- `AuthScreen` handles login, registration, password reset, and Google sign-in
- `AppContext` manages auth state, settings, Firestore subscriptions, and CRUD operations
- `ShiftsScreen` is the main workspace for listing, grouping, creating, editing, and deleting shifts
- `StatisticsScreen` aggregates selected-period metrics and expense breakdowns
- `AccountScreen` combines profile management with embedded app settings

## Available Scripts / Команды

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview the production build
npm run lint      # Run ESLint for src/
npm run lint:fix  # Auto-fix ESLint issues in src/
npm run format    # Run Prettier for src/
npm run test      # Run Vitest
```

## Deployment / Деплой

The app is configured for Firebase Hosting.

Приложение настроено для деплоя на Firebase Hosting.

```bash
npm run build
npx firebase-tools deploy
```

### PWA Cache Update / Обновление PWA-кэша

When shipping a new release, update the cache version in `public/sw.js` so installed users receive the fresh bundle.

При новом релизе обновляйте версию кэша в `public/sw.js`, чтобы пользователи PWA получили новую сборку.

```js
const CACHE_NAME = 'shifts-v22';
```

## Notes / Примечания

- Overnight shifts are automatically assigned correctly when a shift crosses midnight
- Overtime rules are tailored for hourly work and can be configured in settings
- Card tips can be shown as net values after employer deduction
- All user data is stored under the authenticated user's private Firestore path
- Hourly rate is saved per shift at creation time; existing shifts without a stored rate fall back to the current settings rate
- The app respects `prefers-reduced-motion` — all animations are disabled for users who opt out of motion

## Security / Безопасность

- Firebase Authentication is used for access control
- Firestore rules isolate each user's data
- App data is stored in per-user collections under `users/{userId}`

## License

MIT License
