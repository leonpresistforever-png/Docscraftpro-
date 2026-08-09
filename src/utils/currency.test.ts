import { vi, describe, it, expect, afterEach } from 'vitest';
import { getLocalCurrencyInfo } from './currency';

describe('getLocalCurrencyInfo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockTimeZone = (timeZone: string) => {
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone }),
    } as any));
  };

  it('should return INR for Indian timezones', () => {
    mockTimeZone('Asia/Kolkata');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'INR', symbol: '₹', rateToRupee: 1 });

    mockTimeZone('Asia/Calcutta');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'INR', symbol: '₹', rateToRupee: 1 });

    mockTimeZone('Indian/Chagos');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'INR', symbol: '₹', rateToRupee: 1 });
  });

  it('should return GBP for London timezone', () => {
    mockTimeZone('Europe/London');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'GBP', symbol: '£', rateToRupee: 0.0094 });
  });

  it('should return EUR for other European timezones', () => {
    mockTimeZone('Europe/Paris');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'EUR', symbol: '€', rateToRupee: 0.011 });

    mockTimeZone('Europe/Berlin');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'EUR', symbol: '€', rateToRupee: 0.011 });
  });

  it('should return JPY for Tokyo timezone', () => {
    mockTimeZone('Asia/Tokyo');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'JPY', symbol: '¥', rateToRupee: 1.8 });
  });

  it('should return AUD for Australian timezones', () => {
    mockTimeZone('Australia/Sydney');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'AUD', symbol: 'A$', rateToRupee: 0.018 });

    mockTimeZone('Australia/Melbourne');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'AUD', symbol: 'A$', rateToRupee: 0.018 });
  });

  it('should return USD as default for other timezones', () => {
    mockTimeZone('America/New_York');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'USD', symbol: '$', rateToRupee: 0.012 });

    mockTimeZone('America/Los_Angeles');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'USD', symbol: '$', rateToRupee: 0.012 });

    mockTimeZone('Africa/Cairo');
    expect(getLocalCurrencyInfo()).toEqual({ code: 'USD', symbol: '$', rateToRupee: 0.012 });
  });
});
