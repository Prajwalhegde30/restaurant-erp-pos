import { create } from 'zustand';

export interface CartItem {
  id: string; // unique local ID for cart item
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  // Simplified for Task 5.4, modifiers can be added later
}

interface PosState {
  activeTableId: string | null;
  activeOrderId: string | null; // If an order already exists for this table
  cartItems: CartItem[];

  setActiveTable: (tableId: string | null, orderId?: string | null) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const usePosStore = create<PosState>((set) => ({
  activeTableId: null,
  activeOrderId: null,
  cartItems: [],

  setActiveTable: (tableId, orderId = null) =>
    set({ activeTableId: tableId, activeOrderId: orderId }),

  addItem: (item) =>
    set((state) => {
      const existingItem = state.cartItems.find((i) => i.menuItemId === item.menuItemId);
      if (existingItem) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i,
          ),
        };
      }
      return {
        cartItems: [...state.cartItems, { ...item, id: Math.random().toString(36).substring(7) }],
      };
    }),

  removeItem: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      cartItems: state.cartItems.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),

  clearCart: () => set({ cartItems: [] }),
}));
