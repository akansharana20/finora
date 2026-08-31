import Decimal from 'decimal.js';

export function calculateLineVatAndTotal(quantity: number | string | Decimal, unitPrice: number | string | Decimal, vatRatePercent: number | string | Decimal) {
  const qty = new Decimal(quantity);
  const price = new Decimal(unitPrice);
  const rate = new Decimal(vatRatePercent);

  const lineSubtotal = qty.times(price).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const vatAmount = lineSubtotal.times(rate).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const total = lineSubtotal.plus(vatAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    subtotal: lineSubtotal,
    vatAmount,
    total,
  };
}

export function calculateInvoiceTotals(items: Array<{ quantity: number | string; unitPrice: number | string; vatRate: number | string }>) {
  let subtotal = new Decimal(0);
  let vatTotal = new Decimal(0);

  const calculatedItems = items.map((item) => {
    const res = calculateLineVatAndTotal(item.quantity, item.unitPrice, item.vatRate);
    subtotal = subtotal.plus(res.subtotal);
    vatTotal = vatTotal.plus(res.vatAmount);
    return {
      quantity: res.subtotal,
      unitPrice: new Decimal(item.unitPrice),
      vatRate: new Decimal(item.vatRate),
      subtotal: res.subtotal,
      vatAmount: res.vatAmount,
      total: res.total,
    };
  });

  const total = subtotal.plus(vatTotal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    subtotal: subtotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    vatTotal: vatTotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    total,
    calculatedItems,
  };
}
