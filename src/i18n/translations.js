export const translations = {
  ru: {
    // App
    appName: 'Shifts',
    
    // Auth
    login: 'Вход',
    register: 'Регистрация',
    name: 'Имя',
    namePlaceholder: 'Ваше имя',
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    forgotPassword: 'Забыли пароль?',
    resetPassword: 'Сбросить пароль',
    sendResetEmail: 'Отправить письмо',
    backToLogin: 'Вернуться к входу',
    logout: 'Выход',
    
    // Navigation
    shifts: 'Смены',
    statistics: 'Статистика',
    settings: 'Настройки',
    
    // Shift form
    addShift: 'Добавить смену',
    editShift: 'Редактировать смену',
    date: 'Дата',
    workTime: 'Время работы',
    hours: 'Часы',
    minutes: 'Минуты',
    addBreak: 'Добавить перерыв',
    breakStart: 'Начало перерыва',
    breakEnd: 'Конец перерыва',
    breakDuration: 'Длительность перерыва',
    
    // Mileage
    mileage: 'Пробег (км)',
    startOdometer: 'Одометр в начале',
    endOdometer: 'Одометр в конце',
    totalMileage: 'Итого пробег',
    manualMileage: 'Ввести вручную',
    odometerMode: 'По одометру',
    
    // Tips
    tips: 'Чаевые',
    tipsCash: 'Чаевые (нал)',
    tipsCard: 'Чаевые (безнал)',
    
    // Expenses
    expenses: 'Затраты',
    expenseType: 'Тип затрат',
    fuel: 'Бензин',
    tireRepair: 'Ремонт шин',
    carRepair: 'Ремонт машины',
    parking: 'Парковка',
    food: 'Еда',
    other: 'Другое',
    amount: 'Сумма',
    comment: 'Комментарий',
    addExpense: 'Добавить затрату',
    noExpenses: 'Нет затрат',
    
    // Bonus
    bonus: 'Бонусы',
    bonusComment: 'Комментарий к бонусу',
    
    // Work type
    workType: 'Тип работы',
    workTypeHourly: 'Почасовая',
    workTypePieceWork: 'Сдельная',
    ordersCount: 'Количество заказов',
    earnedAmount: 'Заработано',
    avgPerHour: 'Средний в час',
    orders: 'Заказы',
    
    // Actions
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    confirm: 'Подтвердить',
    close: 'Закрыть',
    
    // Settings
    language: 'Язык',
    currency: 'Валюта',
    theme: 'Тема',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',
    hourlyRate: 'Почасовая ставка',
    enableOvertime: 'Считать сверхурочные',
    overtimeInfo: 'После 8ч: 2ч по 125%, далее 150%',
    unpaidLunch: 'Неоплачиваемый обед',
    lunchDuration: 'Длительность обеда (мин)',
    enabledFields: 'Активные поля',
    fieldMileage: 'Пробег',
    fieldTipsCash: 'Чаевые (нал)',
    fieldTipsCard: 'Чаевые (безнал)',
    fieldExpenses: 'Затраты',
    fieldBonus: 'Бонусы',
    tipsCardPercent: 'Вычет с безналичных чаевых (%)',
    account: 'Аккаунт',
    profile: 'Профиль',
    
    // Statistics
    selectPeriod: 'Выберите период',
    today: 'Сегодня',
    thisWeek: 'Эта неделя',
    thisMonth: 'Этот месяц',
    customPeriod: 'Произвольный период',
    custom: 'Произвольный',
    from: 'С',
    to: 'По',
    totalHours: 'Всего часов',
    totalEarnings: 'Общий заработок',
    totalTipsCash: 'Чаевые наличными',
    totalTipsCard: 'Чаевые по карте',
    totalMileageStats: 'Общий пробег',
    totalExpenses: 'Всего затрат',
    totalBonus: 'Всего бонусов',
    netIncome: 'Чистый доход',
    grossIncome: 'Валовый доход',
    shiftsCount: 'Количество смен',
    avgHoursPerShift: 'Средние часы/смена',
    avgIncomePerShift: 'Средний доход/смена',
    expenseDetails: 'Детализация затрат',
    
    // Messages
    noData: 'Нет данных за выбранный период',
    noShifts: 'Нет записанных смен',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    deleteConfirm: 'Вы уверены, что хотите удалить эту смену?',
    
    // Errors
    errorNameRequired: 'Введите имя',
    errorEmailRequired: 'Введите email',
    errorPasswordRequired: 'Введите пароль',
    errorPasswordMismatch: 'Пароли не совпадают',
    errorPasswordWeak: 'Пароль должен быть не менее 6 символов',
    errorInvalidEmail: 'Неверный формат email',
    errorUserNotFound: 'Пользователь не найден',
    errorWrongPassword: 'Неверный пароль',
    errorEmailInUse: 'Email уже используется',
    errorGeneric: 'Произошла ошибка. Попробуйте снова.',
    
    // Time
    yesterday: 'Вчера',
    hoursShort: 'ч',
    minutesShort: 'мин',
    km: 'км',
  },
  
  en: {
    // App
    appName: 'Shifts',
    
    // Auth
    login: 'Login',
    register: 'Register',
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendResetEmail: 'Send Reset Email',
    backToLogin: 'Back to Login',
    logout: 'Logout',
    
    // Navigation
    shifts: 'Shifts',
    statistics: 'Statistics',
    settings: 'Settings',
    
    // Shift form
    addShift: 'Add Shift',
    editShift: 'Edit Shift',
    date: 'Date',
    workTime: 'Work Time',
    hours: 'Hours',
    minutes: 'Minutes',
    addBreak: 'Add Break',
    breakStart: 'Break Start',
    breakEnd: 'Break End',
    breakDuration: 'Break Duration',
    
    // Mileage
    mileage: 'Mileage (km)',
    startOdometer: 'Start Odometer',
    endOdometer: 'End Odometer',
    totalMileage: 'Total Mileage',
    manualMileage: 'Enter Manually',
    odometerMode: 'By Odometer',
    
    // Tips
    tips: 'Tips',
    tipsCash: 'Tips (cash)',
    tipsCard: 'Tips (card)',
    
    // Expenses
    expenses: 'Expenses',
    expenseType: 'Expense Type',
    fuel: 'Fuel',
    tireRepair: 'Tire Repair',
    carRepair: 'Car Repair',
    parking: 'Parking',
    food: 'Food',
    other: 'Other',
    amount: 'Amount',
    comment: 'Comment',
    addExpense: 'Add Expense',
    noExpenses: 'No expenses',
    
    // Bonus
    bonus: 'Bonus',
    bonusComment: 'Bonus Comment',
    
    // Work type
    workType: 'Work Type',
    workTypeHourly: 'Hourly',
    workTypePieceWork: 'Piece-work',
    ordersCount: 'Orders Count',
    earnedAmount: 'Earned',
    avgPerHour: 'Avg per hour',
    orders: 'Orders',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    close: 'Close',
    
    // Settings
    language: 'Language',
    currency: 'Currency',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    hourlyRate: 'Hourly Rate',
    enableOvertime: 'Calculate Overtime',
    overtimeInfo: 'After 8h: 2h at 125%, then 150%',
    unpaidLunch: 'Unpaid Lunch',
    lunchDuration: 'Lunch Duration (min)',
    enabledFields: 'Enabled Fields',
    fieldMileage: 'Mileage',
    fieldTipsCash: 'Tips (cash)',
    fieldTipsCard: 'Tips (card)',
    fieldExpenses: 'Expenses',
    fieldBonus: 'Bonus',
    tipsCardPercent: 'Card Tips Deduction (%)',
    account: 'Account',
    profile: 'Profile',
    
    // Statistics
    selectPeriod: 'Select Period',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    customPeriod: 'Custom Period',
    custom: 'Custom',
    from: 'From',
    to: 'To',
    totalHours: 'Total Hours',
    totalEarnings: 'Total Earnings',
    totalTipsCash: 'Total Cash Tips',
    totalTipsCard: 'Total Card Tips',
    totalMileageStats: 'Total Mileage',
    totalExpenses: 'Total Expenses',
    totalBonus: 'Total Bonus',
    netIncome: 'Net Income',
    grossIncome: 'Gross Income',
    shiftsCount: 'Shifts Count',
    avgHoursPerShift: 'Avg Hours/Shift',
    avgIncomePerShift: 'Avg Income/Shift',
    expenseDetails: 'Expense Details',
    
    // Messages
    noData: 'No data for selected period',
    noShifts: 'No recorded shifts',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    deleteConfirm: 'Are you sure you want to delete this shift?',
    
    // Errors
    errorNameRequired: 'Name is required',
    errorEmailRequired: 'Email is required',
    errorPasswordRequired: 'Password is required',
    errorPasswordMismatch: 'Passwords do not match',
    errorPasswordWeak: 'Password must be at least 6 characters',
    errorInvalidEmail: 'Invalid email format',
    errorUserNotFound: 'User not found',
    errorWrongPassword: 'Wrong password',
    errorEmailInUse: 'Email already in use',
    errorGeneric: 'An error occurred. Please try again.',
    
    // Time
    yesterday: 'Yesterday',
    hoursShort: 'h',
    minutesShort: 'min',
    km: 'km',
  },
  
  he: {
    // App
    appName: 'Shifts',
    
    // Auth
    login: 'התחברות',
    register: 'הרשמה',
    name: 'שם',
    namePlaceholder: 'השם שלך',
    email: 'אימייל',
    password: 'סיסמה',
    confirmPassword: 'אימות סיסמה',
    forgotPassword: 'שכחת סיסמה?',
    resetPassword: 'איפוס סיסמה',
    sendResetEmail: 'שלח מייל איפוס',
    backToLogin: 'חזור להתחברות',
    logout: 'התנתקות',
    
    // Navigation
    shifts: 'משמרות',
    statistics: 'סטטיסטיקה',
    settings: 'הגדרות',
    
    // Shift form
    addShift: 'הוסף משמרת',
    editShift: 'ערוך משמרת',
    date: 'תאריך',
    workTime: 'שעות עבודה',
    hours: 'שעות',
    minutes: 'דקות',
    addBreak: 'הוסף הפסקה',
    breakStart: 'תחילת הפסקה',
    breakEnd: 'סוף הפסקה',
    breakDuration: 'משך ההפסקה',
    
    // Mileage
    mileage: 'קילומטראז\'',
    startOdometer: 'מד מרחק התחלה',
    endOdometer: 'מד מרחק סיום',
    totalMileage: 'סה"כ קילומטרים',
    manualMileage: 'הזן ידנית',
    odometerMode: 'לפי מד מרחק',
    
    // Tips
    tips: 'טיפים',
    tipsCash: 'טיפים (מזומן)',
    tipsCard: 'טיפים (אשראי)',
    
    // Expenses
    expenses: 'הוצאות',
    expenseType: 'סוג הוצאה',
    fuel: 'דלק',
    tireRepair: 'תיקון צמיגים',
    carRepair: 'תיקון רכב',
    parking: 'חניה',
    food: 'אוכל',
    other: 'אחר',
    amount: 'סכום',
    comment: 'הערה',
    addExpense: 'הוסף הוצאה',
    noExpenses: 'אין הוצאות',
    
    // Bonus
    bonus: 'בונוס',
    bonusComment: 'הערה לבונוס',
    
    // Work type
    workType: 'סוג עבודה',
    workTypeHourly: 'שעתית',
    workTypePieceWork: 'קבלנית',
    ordersCount: 'מספר הזמנות',
    earnedAmount: 'הרווחת',
    avgPerHour: 'ממוצע לשעה',
    orders: 'הזמנות',
    
    // Actions
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    edit: 'ערוך',
    confirm: 'אישור',
    close: 'סגור',
    
    // Settings
    language: 'שפה',
    currency: 'מטבע',
    theme: 'ערכת נושא',
    themeDark: 'כהה',
    themeLight: 'בהיר',
    hourlyRate: 'שכר שעתי',
    enableOvertime: 'חשב שעות נוספות',
    overtimeInfo: 'אחרי 8 שעות: 2 שעות ב-125%, אח"כ 150%',
    unpaidLunch: 'הפסקת צהריים ללא תשלום',
    lunchDuration: 'משך ההפסקה (דקות)',
    enabledFields: 'שדות פעילים',
    fieldMileage: 'קילומטראז\'',
    fieldTipsCash: 'טיפים (מזומן)',
    fieldTipsCard: 'טיפים (אשראי)',
    fieldExpenses: 'הוצאות',
    fieldBonus: 'בונוס',
    tipsCardPercent: 'ניכוי מטיפים באשראי (%)',
    account: 'חשבון',
    profile: 'פרופיל',
    
    // Statistics
    selectPeriod: 'בחר תקופה',
    today: 'היום',
    thisWeek: 'השבוע',
    thisMonth: 'החודש',
    customPeriod: 'תקופה מותאמת',
    custom: 'מותאם',
    from: 'מ',
    to: 'עד',
    totalHours: 'סה"כ שעות',
    totalEarnings: 'סה"כ הכנסות',
    totalTipsCash: 'סה"כ טיפים במזומן',
    totalTipsCard: 'סה"כ טיפים בכרטיס',
    totalMileageStats: 'סה"כ קילומטרים',
    totalExpenses: 'סה"כ הוצאות',
    totalBonus: 'סה"כ בונוסים',
    netIncome: 'הכנסה נטו',
    grossIncome: 'הכנסה ברוטו',
    shiftsCount: 'מספר משמרות',
    avgHoursPerShift: 'ממוצע שעות/משמרת',
    avgIncomePerShift: 'ממוצע הכנסה/משמרת',
    expenseDetails: 'פירוט הוצאות',
    
    // Messages
    noData: 'אין נתונים לתקופה הנבחרת',
    noShifts: 'אין משמרות רשומות',
    loading: 'טוען...',
    error: 'שגיאה',
    success: 'הצלחה',
    deleteConfirm: 'האם אתה בטוח שברצונך למחוק משמרת זו?',
    
    // Errors
    errorNameRequired: 'נדרש שם',
    errorEmailRequired: 'נדרש אימייל',
    errorPasswordRequired: 'נדרשת סיסמה',
    errorPasswordMismatch: 'הסיסמאות אינן תואמות',
    errorPasswordWeak: 'הסיסמה חייבת להכיל לפחות 6 תווים',
    errorInvalidEmail: 'פורמט אימייל לא תקין',
    errorUserNotFound: 'משתמש לא נמצא',
    errorWrongPassword: 'סיסמה שגויה',
    errorEmailInUse: 'האימייל כבר בשימוש',
    errorGeneric: 'אירעה שגיאה. נסה שוב.',
    
    // Time
    yesterday: 'אתמול',
    hoursShort: 'ש\'',
    minutesShort: 'ד\'',
    km: 'ק"מ',
  }
};

export const getTranslation = (lang = 'ru') => {
  return translations[lang] || translations.ru;
};

export const isRTL = (lang) => {
  return lang === 'he';
};
