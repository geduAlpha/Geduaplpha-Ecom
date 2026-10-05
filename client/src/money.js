export const FREE_SHIPPING_OVER = 6000; // cents, keep in sync with server/index.js
export const FLAT_SHIPPING = 599;

export const money = (cents) => `$${(cents / 100).toFixed(2)}`;
export const shippingFor = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;
