"use client";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PaymentStatusManager = () => {
  const [status, setStatus] = useState("loading");
  const [paymentData, setPaymentData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get status from URL parameters
    const urlStatus = searchParams.get("status");
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("order_id");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");

    if (urlStatus) {
      setStatus(urlStatus);
      setPaymentData({
        sessionId,
        orderId,
        amount,
        currency,
      });
    } else {
      // Default to canceled if no status provided
      setStatus("success");
    }
  }, [searchParams]);

  // Payment Success Component
  const PaymentSuccess = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon
            icon="mdi:check-circle"
            className="text-white"
            width={48}
            height={48}
          />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Thank you for your purchase. Your payment has been processed
          successfully.
        </p>

        {/* Payment Details */}
        {paymentData && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Icon
                icon="mdi:receipt"
                className="mr-2"
                width={20}
                height={20}
              />
              Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              {paymentData.orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-gray-800">
                    #{paymentData.orderId}
                  </span>
                </div>
              )}
              {paymentData.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-800">
                    {paymentData.currency || "$"}
                    {paymentData.amount}
                  </span>
                </div>
              )}
              {paymentData.sessionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-gray-800 text-xs">
                    {paymentData.sessionId.substring(0, 20)}...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold flex items-center justify-center"
          >
            <Icon
              icon="mdi:view-dashboard"
              className="mr-2"
              width={20}
              height={20}
            />
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Back to Home
          </button>
        </div>

        {/* Success Animation */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Payment Failed Component
  const PaymentFailed = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        {/* Failed Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon
            icon="mdi:close-circle"
            className="text-white"
            width={48}
            height={48}
          />
        </div>

        {/* Failed Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          We couldn't process your payment. Please try again or contact support
          if the problem persists.
        </p>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center mb-3">
            <Icon
              icon="mdi:alert-circle"
              className="text-red-600 mr-2"
              width={20}
              height={20}
            />
            <h3 className="font-semibold text-red-800">What went wrong?</h3>
          </div>
          <ul className="text-sm text-red-700 text-left space-y-1">
            <li>• Insufficient funds</li>
            <li>• Card declined</li>
            <li>• Network timeout</li>
            <li>• Invalid payment information</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-semibold flex items-center justify-center"
          >
            <Icon icon="mdi:refresh" className="mr-2" width={20} height={20} />
            Try Again
          </button>
          <button
            onClick={() => router.push("/support")}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center"
          >
            <Icon
              icon="mdi:help-circle"
              className="mr-2"
              width={20}
              height={20}
            />
            Contact Support
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors duration-200 font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // Payment Canceled Component
  const PaymentCanceled = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        {/* Canceled Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon
            icon="mdi:cancel"
            className="text-white"
            width={48}
            height={48}
          />
        </div>

        {/* Canceled Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Canceled
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          You canceled the payment process. No charges were made to your
          account.
        </p>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center mb-3">
            <Icon
              icon="mdi:information"
              className="text-yellow-600 mr-2"
              width={20}
              height={20}
            />
            <h3 className="font-semibold text-yellow-800">What happens now?</h3>
          </div>
          <p className="text-sm text-yellow-700 text-left">
            Your items are still in your cart and will be saved for 24 hours.
            You can complete your purchase anytime during this period.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/cart")}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 font-semibold flex items-center justify-center"
          >
            <Icon icon="mdi:cart" className="mr-2" width={20} height={20} />
            Return to Cart
          </button>
          <button
            onClick={() => router.push("/shop")}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center"
          >
            <Icon icon="mdi:shopping" className="mr-2" width={20} height={20} />
            Continue Shopping
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors duration-200 font-medium"
          >
            Back to Home
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Need help?</p>
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => router.push("/faq")}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Icon
                icon="mdi:frequently-asked-questions"
                className="mr-1"
                width={16}
                height={16}
              />
              FAQ
            </button>
            <button
              onClick={() => router.push("/support")}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Icon
                icon="mdi:message-text"
                className="mr-1"
                width={16}
                height={16}
              />
              Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading Component
  const PaymentLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon
            icon="mdi:loading"
            className="text-white animate-spin"
            width={48}
            height={48}
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Processing Payment
        </h1>
        <p className="text-gray-600 text-lg">
          Please wait while we verify your payment status...
        </p>
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render appropriate component based on status
  const renderPaymentStatus = () => {
    switch (status) {
      case "success":
        return <PaymentSuccess />;
      case "failed":
        return <PaymentFailed />;
      case "canceled":
        return <PaymentCanceled />;
      default:
        return <PaymentLoading />;
    }
  };

  return renderPaymentStatus();
};

export default PaymentStatusManager;
