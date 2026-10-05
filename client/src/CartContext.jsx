import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "marigold-cart-v1";
const MAX_QTY = 20;

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const existing = state.find((i) => i.id === action.product.id);
      if (existing) {
        return state.map((i) =>
          i.id === existing.id ? { ...i, qty: Math.min(i.qty + action.qty, MAX_QTY) } : i
        );
      }
      const { id, name, price, color, tint, art } = action.product;
      return [...state, { id, name, price, color, tint, art, qty: Math.min(action.qty, MAX_QTY) }];
    }
    case "qty":
      return state
        .map((i) => (i.id === action.id ? { ...i, qty: Math.min(action.qty, MAX_QTY) } : i))
        .filter((i) => i.qty > 0);
    case "remove":
      return state.filter((i) => i.id !== action.id);
    case "clear":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage can be unavailable; the cart still works for this session */
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      open,
      setOpen,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
      add: (product, qty = 1) => {
        dispatch({ type: "add", product, qty });
        setOpen(true);
      },
      setQty: (id, qty) => dispatch({ type: "qty", id, qty }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items, open]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
