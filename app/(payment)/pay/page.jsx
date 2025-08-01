import PaymentStatusManager from "@/components/payment/PaymentManager";
import { Suspense } from "react";

// Loading fallback component
const PaymentLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoadingFallback />}>
      <PaymentStatusManager />
    </Suspense>
  );
}
