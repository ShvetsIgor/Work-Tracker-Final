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
  CAD: { 
    symbol: 'C$', 
    name: 'Canadian Dollar',
    code: 'CAD',
    locale: 'en-CA'
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
