export const currencies = {
  ILS: { 
    symbol: '₪', 
    name: 'Israeli Shekel',
    code: 'ILS',
    locale: 'he-IL'
  },
  USD: { 
    symbol: '$', 
    name: 'US Dollar',
    code: 'USD',
    locale: 'en-US'
  },
  EUR: { 
    symbol: '€', 
    name: 'Euro',
    code: 'EUR',
    locale: 'de-DE'
  },
  RUB: { 
    symbol: '₽', 
    name: 'Russian Ruble',
    code: 'RUB',
    locale: 'ru-RU'
  },
  GBP: {
    symbol: '£',
    name: 'British Pound',
    code: 'GBP',
    locale: 'en-GB'
  },
  UAH: {
    symbol: '₴',
    name: 'Ukrainian Hryvnia',
    code: 'UAH',
    locale: 'uk-UA'
  }
};

export const defaultCurrency = 'ILS';

export const getCurrencySymbol = (code) => {
  return currencies[code]?.symbol || code;
};

export const formatCurrency = (amount, currencyCode = defaultCurrency) => {
  const currency = currencies[currencyCode];
  if (!currency) return `${amount.toFixed(2)}`;
  
  return `${currency.symbol}${amount.toFixed(2)}`;
};
