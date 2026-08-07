'use client';

import { useState } from 'react';
import { useProcessPayment } from '../../hooks/useOrders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
} from '@repo/ui';
import { useApplyCoupon, useRedeemGiftCard } from '../../hooks/useCustomers';
import { usePosStore } from '../../store/posStore';

export function PaymentDialog({
  orderId,
  amount,
  currentVersion,
  onClose,
}: {
  orderId: string;
  amount: number;
  currentVersion: number;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'OTHER'>('CARD');
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');

  const { activeCustomerId } = usePosStore();
  const processPaymentMutation = useProcessPayment();
  const applyCouponMutation = useApplyCoupon();
  const redeemGiftCardMutation = useRedeemGiftCard();

  const handleSettle = () => {
    processPaymentMutation.mutate(
      {
        orderId,
        amount,
        paymentMethod: method,
        currentVersion,
      },
      {
        onSuccess: () => {
          setError(null);
          onClose(); // In a real app, maybe show a success toast before closing
        },
        onError: (err: Error) => {
          setError(`Payment failed: ${err.message || 'Unknown error'}`);
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

        <div className="flex flex-col items-center justify-center py-6 border-b">
          <div className="text-sm text-muted-foreground mb-1">Amount Due</div>
          <div className="text-4xl font-bold">${amount.toFixed(2)}</div>
        </div>

        {activeCustomerId && (
          <div className="flex flex-col gap-3 py-4 border-b">
            <div className="text-sm font-semibold">Apply Offers</div>
            <div className="flex gap-2">
              <Input
                placeholder="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="secondary"
                disabled={!couponCode || applyCouponMutation.isPending}
                onClick={() => {
                  applyCouponMutation.mutate(
                    { customerId: activeCustomerId, code: couponCode, orderId },
                    {
                      onSuccess: () => {
                        setCouponCode('');
                        setError(null);
                      },
                      onError: (err: Error) => setError(err.message),
                    },
                  );
                }}
              >
                Apply Coupon
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Gift Card Code"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="secondary"
                disabled={!giftCardCode || redeemGiftCardMutation.isPending}
                onClick={() => {
                  redeemGiftCardMutation.mutate(
                    { customerId: activeCustomerId, code: giftCardCode, orderId, amount },
                    {
                      onSuccess: () => {
                        setGiftCardCode('');
                        setError(null);
                      },
                      onError: (err: Error) => setError(err.message),
                    },
                  );
                }}
              >
                Redeem Card
              </Button>
            </div>
          </div>
        )}

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

        {error && <div className="text-sm text-destructive text-center w-full px-4">{error}</div>}

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
