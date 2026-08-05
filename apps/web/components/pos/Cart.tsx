'use client';

import { usePosStore } from '../../store/posStore';
import { useCreateOrder } from '../../hooks/useOrders';
import { Button, Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui';
import { PaymentDialog } from './PaymentDialog';
import { useState, useEffect } from 'react';

export function Cart({ branchId }: { branchId: string }) {
  const {
    activeTableId,
    activeOrderId,
    activeOrderVersion,
    activeOrderTotal,
    cartItems,
    removeItem,
    updateQuantity,
    clearCart,
  } = usePosStore();
  const createOrderMutation = useCreateOrder();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  if (!activeTableId) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedTax = subtotal * 0.1; // Simulated 10% tax
  const estimatedTotal = subtotal + estimatedTax;

  const displayTotal = activeOrderTotal !== null ? activeOrderTotal : estimatedTotal;

  const handleFire = () => {
    if (cartItems.length === 0) return;

    // In a real app, if activeOrderId exists, we would call an update/append endpoint.
    // For this Task 5.4, we just map it to the create order endpoint.
    createOrderMutation.mutate(
      {
        branchId,
        tableId: activeTableId,
        orderType: 'DINE_IN',
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      },
      {
        onSuccess: () => {
          clearCart();
          setError(null);
          setSuccess('Order fired successfully!');
        },
        onError: (err: Error) => {
          setError(`Failed to fire order: ${err.message || 'Unknown error'}`);
          setSuccess(null);
        },
      },
    );
  };

  return (
    <Card className="w-80 flex flex-col h-full rounded-none border-y-0 border-r-0">
      <CardHeader className="py-4 px-4 bg-muted/50">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Table {activeTableId}</span>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-xs h-8">
            Clear
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 p-0">
        {cartItems.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            {activeOrderId ? 'Add items to existing order' : 'Cart is empty'}
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4 px-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm leading-tight pr-2">{item.name}</span>
                  <span className="font-bold text-sm shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-2 bg-muted rounded-md p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-sm"
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.id, item.quantity - 1)
                          : removeItem(item.id)
                      }
                    >
                      -
                    </Button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col p-4 bg-muted/20 border-t gap-4 shrink-0">
        <div className="flex flex-col w-full gap-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Estimated Tax (10%)</span>
            <span>${estimatedTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t mt-1">
            <span>{activeOrderTotal !== null ? 'Order Total' : 'Estimated Total'}</span>
            <span>${displayTotal.toFixed(2)}</span>
          </div>
        </div>

        {error && <div className="text-sm text-destructive text-center w-full">{error}</div>}
        {success && <div className="text-sm text-green-600 text-center w-full">{success}</div>}

        <div className="flex flex-col gap-2 w-full">
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            size="lg"
            disabled={cartItems.length === 0 || createOrderMutation.isPending}
            onClick={handleFire}
          >
            {createOrderMutation.isPending ? 'Firing...' : 'Fire to Kitchen'}
          </Button>

          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
            size="lg"
            disabled={!activeOrderId && cartItems.length > 0} // Can only pay if order exists or paying new
            onClick={() => setIsPaymentOpen(true)}
          >
            Pay / Settle
          </Button>
        </div>
      </CardFooter>

      {isPaymentOpen && activeOrderId && (
        <PaymentDialog
          orderId={activeOrderId}
          amount={activeOrderTotal || 0}
          currentVersion={activeOrderVersion || 1}
          onClose={() => setIsPaymentOpen(false)}
        />
      )}
    </Card>
  );
}
