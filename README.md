# 📊 Shift Manager / Менеджер Смен

A comprehensive shift management application for hourly workers with expense tracking, tips management, and detailed statistics.

Комплексное приложение для управления сменами почасовых работников с отслеживанием затрат, чаевых и детальной статистикой.

![Shift Manager](https://img.shields.io/badge/React-18-blue) ![Firebase](https://img.shields.io/badge/Firebase-10-orange) ![Tailwind](https://img.shields.io/badge/Tailwind-3-teal)

## ✨ Features / Возможности

### 📝 Shift Tracking / Отслеживание смен
- Record work hours with automatic date handling for overnight shifts
- Add breaks with start/end times
- Track mileage (manual or odometer readings)
- Record cash and card tips
- Log expenses with categories (fuel, repairs, parking, etc.)
- Add bonuses with comments

### 📊 Statistics / Статистика
- View statistics for today, this week, this month, or custom periods
- Total hours, earnings, tips, mileage, expenses
- Net income calculation
- Average hours and income per shift
- Expense breakdown by category

### ⚙️ Settings / Настройки
- **Languages**: Russian, English, Hebrew (with RTL support)
- **Currencies**: ILS, USD, EUR, RUB, GBP, UAH
- **Hourly rate** with overtime calculation (125%/150%)
- **Unpaid lunch** deduction
- **Card tips deduction** percentage
- **Toggle fields** on/off based on your needs

## 🚀 Getting Started / Начало работы

### Prerequisites / Требования
- Node.js 18+
- npm or yarn
- Firebase project

### Installation / Установка

1. Clone the repository / Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/shift-manager.git
cd shift-manager
```

2. Install dependencies / Установите зависимости:
```bash
npm install
```

3. Create Firebase project / Создайте проект Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Get your config from Project Settings

4. Configure environment / Настройте окружение:
```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Set up Firestore Security Rules / Настройте правила безопасности Firestore:
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

6. Start development server / Запустите сервер разработки:
```bash
npm run dev
```

## 📁 Project Structure / Структура проекта

```
shift-manager/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── index.jsx        # Reusable UI components
│   │   │   └── Modal.jsx        # Modal component
│   │   ├── AuthScreen.jsx       # Login/Register screen
│   │   ├── Header.jsx           # App header
│   │   ├── Navigation.jsx       # Bottom navigation
│   │   ├── ShiftModal.jsx       # Add/Edit shift modal
│   │   ├── ShiftsScreen.jsx     # Shifts list screen
│   │   ├── StatisticsScreen.jsx # Statistics screen
│   │   └── SettingsScreen.jsx   # Settings screen
│   ├── config/
│   │   ├── firebase.js          # Firebase configuration
│   │   ├── currencies.js        # Currency definitions
│   │   └── defaults.js          # Default settings
│   ├── context/
│   │   └── AppContext.jsx       # Global app context
│   ├── i18n/
│   │   └── translations.js      # Translations (RU/EN/HE)
│   ├── styles/
│   │   └── index.css            # Global styles & Tailwind
│   ├── utils/
│   │   ├── calculations.js      # Earnings calculations
│   │   ├── dateUtils.js         # Date utilities
│   │   └── formatters.js        # Formatting utilities
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── README.md
```

## 🔧 Scripts / Команды

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code with ESLint
npm run lint:fix  # Auto-fix lint issues
npm run format    # Format code with Prettier
npm run test      # Run tests
```

## 🚢 Deployment / Деплой

The app is deployed to Firebase Hosting.

```bash
npm run build
npx firebase-tools deploy
```

### PWA Cache Update / Обновление кэша PWA

After each release, increment the cache version in `public/sw.js` so users with the installed PWA receive the updated app:

```js
// public/sw.js
const CACHE_NAME = 'shifts-v22'; // bump this on every deploy
```

The service worker will automatically delete the old cache and load the new version on the user's next visit.

## 💡 Usage Tips / Советы по использованию

### Overnight Shifts / Ночные смены
The app automatically handles shifts that end after midnight. If you add a shift between 00:00-03:00, it will be assigned to the previous day.

### Overtime Calculation / Расчёт сверхурочных
Based on Israeli labor law:
- First 8 hours: 100% rate
- Hours 9-10: 125% rate
- Hours 11+: 150% rate

### Card Tips Deduction / Вычет с карточных чаевых
Some employers deduct a percentage from card tips. Configure this in Settings to see accurate net income.

## 🌐 Localization / Локализация

The app supports:
- 🇷🇺 Russian (Русский)
- 🇺🇸 English
- 🇮🇱 Hebrew (עברית) with RTL layout

## 📱 Mobile-First Design

The app is optimized for mobile devices with:
- Responsive layout
- Touch-friendly controls
- Native-like navigation
- Safe area support for notched devices

## 🔐 Security

- All data is stored in user's private Firestore collection
- Firebase Authentication for secure login
- Firestore security rules prevent unauthorized access

## 📄 License

MIT License - see LICENSE file for details.

---

Made with ❤️ for hourly workers everywhere.
