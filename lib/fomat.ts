export const formatPrice = (price: number, locale: string = "en-US") => {
  // Format only the numeric portion to avoid server/client differences
  // with currency symbol placement. We will add the symbol in the UI.
  return new Intl.NumberFormat(locale, {
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};
 
