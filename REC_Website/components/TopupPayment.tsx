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
  const [success, setSuccess] = useState(false);

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
    setSuccess(true);
    setSubmitting(false);
    // Delay: show success animation then call onDone
    setTimeout(() => {
      onDone();
    }, 1600);
  };

  return (
    <div className="space-y-4">
      {!success ? (
        <>
          <PaymentElement />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            disabled={submitting}
            className="w-full bg-rectify-green text-white py-3 rounded-lg disabled:opacity-50 text-lg font-semibold"
            onClick={onPay}
          >
            {submitting ? 'Processing…' : 'Pay'}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center animate-[pulse_1.2s_ease-in-out_1]">
            <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div className="mt-4 text-xl font-semibold">Deposit Submitted</div>
          <div className="mt-1 text-sm text-neutral-400 text-center max-w-sm">Your payment was received and will be available after confirmation.</div>
        </div>
      )}
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


