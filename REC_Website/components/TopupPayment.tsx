import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

function TopupForm({ amount, currency, onDone }: { amount: number; currency: 'aed' | 'usd'; onDone: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/?topup=return` },
      redirect: 'if_required',
    });
    if (error) {
      setError(error.message || 'Payment failed');
      setSubmitting(false);
      return;
    }
    onDone();
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <PaymentElement />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        disabled={submitting}
        className="w-full bg-rectify-green text-white py-2 rounded disabled:opacity-50"
        onClick={onPay}
      >
        {submitting ? 'Processing…' : 'Pay'}
      </button>
    </div>
  );
}

export default function TopupPayment({ amount, currency, onDone }: { amount: number; currency: 'aed' | 'usd'; onDone: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.createTopupIntent(amount, currency);
        if (res.success && (res as any).clientSecret) setClientSecret((res as any).clientSecret);
        else setError((res as any).message || 'Failed to initialize payment');
      } catch (e: any) {
        setError(e?.message || 'Failed to initialize payment');
      }
    })();
  }, [amount, currency]);

  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!clientSecret) return <div className="text-sm text-muted-foreground">Preparing payment…</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <TopupForm amount={amount} currency={currency} onDone={onDone} />
    </Elements>
  );
}


