export const FREE_SHIPPING_OVER = 5000; // 5,000 ETB
export const FLAT_SHIPPING = 250;       // 250 ETB

export const money = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "Br 0";
  return `Br ${Number(amount).toLocaleString()}`;
};

export const shippingFor = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;
