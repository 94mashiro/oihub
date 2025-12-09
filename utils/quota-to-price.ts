export const quotaToPrice = (quota: number, quotaPerUnit = 1, unit?: string) => {
  return `${showDisplayUnit(unit)}${(quota / quotaPerUnit).toFixed(2)}`;
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
