export interface ProductPriceInfo {
  originalPrice: number;
  finalPrice: number;
  discountPercentage: number;
  isFestivalSale: boolean;
  savings: number;
}

/**
 * Calculates the best available price for a product.
 * @param originalPrice - The base price of the product
 * @param productSalePercentage - The specific discount set on the product (0-100)
 * @param activeFestivalPercentage - The site-wide discount from an active festival (0-100)
 */
export function calculateBestPrice(
  originalPrice: number,
  productSalePercentage: number = 0,
  activeFestivalPercentage: number = 0
): ProductPriceInfo {
  const basePrice = Number(originalPrice);
  const pSale = Number(productSalePercentage);
  const fSale = Number(activeFestivalPercentage);

  // We use the HIGHEST discount available, not combined (to protect margins)
  const bestDiscount = Math.max(pSale, fSale);
  const isFestivalSale = fSale > pSale && fSale > 0;
  
  const discountAmount = (basePrice * bestDiscount) / 100;
  const finalPrice = basePrice - discountAmount;

  return {
    originalPrice: basePrice,
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    discountPercentage: bestDiscount,
    isFestivalSale,
    savings: parseFloat(discountAmount.toFixed(2))
  };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
