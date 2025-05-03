
import React, { createContext, useContext, useState } from 'react';
import { CartItem } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, type: 'post' | 'comment') => void;
  clearCart: () => void;
  isInCart: (id: string, type: 'post' | 'comment') => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    // Check if item already exists in cart
    if (isInCart(item.id, item.type)) {
      toast.info("Item already in cart");
      return;
    }
    
    setCartItems(prev => [...prev, item]);
    toast.success(`Added ${item.type} to cart`);
  };

  const removeFromCart = (id: string, type: 'post' | 'comment') => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
    toast.info(`Removed ${type} from cart`);
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info('Cart cleared');
  };

  const isInCart = (id: string, type: 'post' | 'comment'): boolean => {
    return cartItems.some(item => item.id === id && item.type === type);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
