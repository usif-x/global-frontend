import { Icon } from "@iconify/react";
import { useState } from "react";

const IframePaymentModal = ({ isOpen, onClose, paymentUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            Complete Your Payment
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon icon="lucide:x" className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body with Iframe */}
        <div className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
              <Icon
                icon="lucide:loader-2"
                className="w-8 h-8 animate-spin text-blue-600"
              />
              <p className="mt-4 text-gray-600">
                Loading secure payment gateway...
              </p>
            </div>
          )}
          <iframe
            src={paymentUrl}
            title="EasyKash Secure Payment"
            className={`w-full h-full border-0 transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsLoading(false)}
            allow="payment"
          />
        </div>
        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t text-center text-xs text-gray-500">
          <p>
            Once your payment is complete, you can close this window. Your
            invoice status will be updated automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IframePaymentModal;
