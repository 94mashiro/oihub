export const quotaToPrice = (quota: number, quotaPerUnit = 1, unit?: string) => {
  const value = quota / quotaPerUnit;
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${showDisplayUnit(unit)}${formatted}`;
};

const showDisplayUnit = (unit?: string) => {
  if (unit === 'CNY') {
    return '¥';
  }
  if (unit === 'USD') {
    return '$';
  }
  return '';
};
