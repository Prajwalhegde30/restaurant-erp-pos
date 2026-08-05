'use client';

import { useState } from 'react';
import { useProcessPayment } from '../../hooks/useOrders';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button } from '@repo/ui';

export function PaymentDialog({
  orderId,
  amount,
  onClose,
}: {
  orderId: string;
  amount: number;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'OTHER'>('CARD');
  const processPaymentMutation = useProcessPayment();

  const handleSettle = () => {
    processPaymentMutation.mutate(
      {
        orderId,
        amount,
        paymentMethod: method,
        currentVersion: 1, // In a real app, this should come from the fetched order data
      },
      {
        onSuccess: () => {
          alert('Payment processed successfully!');
          onClose();
        },
        onError: (err: Error) => {
          alert(`Payment failed: ${err.message || 'Unknown error'}`);
        },
      },
    );
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settle Bill</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-sm text-muted-foreground mb-1">Amount Due</div>
          <div className="text-4xl font-bold">${amount.toFixed(2)}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant={method === 'CASH' ? 'default' : 'outline'}
            onClick={() => setMethod('CASH')}
            className="h-16"
          >
            Cash
          </Button>
          <Button
            variant={method === 'CARD' ? 'default' : 'outline'}
            onClick={() => setMethod('CARD')}
            className="h-16"
          >
            Card
          </Button>
          <Button
            variant={method === 'UPI' ? 'default' : 'outline'}
            onClick={() => setMethod('UPI')}
            className="h-16"
          >
            UPI
          </Button>
          <Button
            variant={method === 'OTHER' ? 'default' : 'outline'}
            onClick={() => setMethod('OTHER')}
            className="h-16"
          >
            Other
          </Button>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSettle}
            disabled={processPaymentMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
          >
            {processPaymentMutation.isPending ? 'Processing...' : 'Settle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
