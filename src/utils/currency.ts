export const getLocalCurrencyInfo = () => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.includes('India') || tz.includes('Kolkata') || tz.includes('Asia/Calcutta')) {
    return { code: 'INR', symbol: '₹', rateToRupee: 1 };
  } else if (tz.includes('Europe')) {
    if (tz.includes('London')) return { code: 'GBP', symbol: '£', rateToRupee: 0.0094 };
    return { code: 'EUR', symbol: '€', rateToRupee: 0.011 };
  } else if (tz.includes('Asia/Tokyo')) {
    return { code: 'JPY', symbol: '¥', rateToRupee: 1.8 };
  } else if (tz.includes('Australia')) {
    return { code: 'AUD', symbol: 'A$', rateToRupee: 0.018 };
  }
  // Default US
  return { code: 'USD', symbol: '$', rateToRupee: 0.012 };
}
