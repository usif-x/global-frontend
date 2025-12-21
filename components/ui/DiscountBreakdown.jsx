/**
 * Discount Breakdown Display Component
 *
 * Shows detailed price breakdown including base price,
 * group discounts, promo code discounts, and final price.
 *
 * @component
 */

import { Icon } from "@iconify/react";

const DiscountBreakdown = ({ discountBreakdown, currency = "EGP" }) => {
  if (!discountBreakdown) return null;

  const {
    base_price,
    total_discount,
    final_price,
    group_discount,
    promo_discount,
  } = discountBreakdown;

  const formatPrice = (price) => {
    if (!price && price !== 0) return "0";
    return Math.round(price).toLocaleString();
  };

  const hasSavings = total_discount > 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
      <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
        <Icon icon="mdi:calculator" className="w-5 h-5 mr-2 text-blue-600" />
        Price Breakdown
      </h4>

      <div className="space-y-3">
        {/* Base Price */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Base Price:</span>
          <span className="font-semibold text-gray-800">
            {currency} {formatPrice(base_price)}
          </span>
        </div>

        {/* Group Discount */}
        {group_discount && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 -mx-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-green-700 font-medium flex items-center">
                <Icon icon="mdi:account-group" className="w-4 h-4 mr-1.5" />
                Group Discount ({group_discount.percentage}%)
              </span>
              <span className="font-bold text-green-700">
                - {currency} {formatPrice(group_discount.amount)}
              </span>
            </div>
            <p className="text-xs text-green-600">
              {group_discount.applied_because ||
                "Group booking discount applied"}
            </p>
          </div>
        )}

        {/* Promo Code Discount */}
        {promo_discount && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 -mx-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-purple-700 font-medium flex items-center">
                <Icon icon="mdi:ticket-percent" className="w-4 h-4 mr-1.5" />
                Promo Code ({promo_discount.percentage}%)
              </span>
              <span className="font-bold text-purple-700">
                - {currency} {formatPrice(promo_discount.amount)}
              </span>
            </div>
            <p className="text-xs text-purple-600 font-mono">
              Code: {promo_discount.code}
            </p>
          </div>
        )}

        {/* Total Savings */}
        {hasSavings && (
          <div className="flex justify-between items-center pt-2 border-t border-blue-200">
            <span className="text-green-600 font-semibold flex items-center">
              <Icon icon="mdi:piggy-bank" className="w-4 h-4 mr-1.5" />
              Total Savings:
            </span>
            <span className="font-bold text-green-600 text-lg">
              {currency} {formatPrice(total_discount)}
            </span>
          </div>
        )}

        {/* Final Price */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-4 -mx-1 mt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm mb-1">Final Amount</p>
              <p className="font-black text-2xl">
                {currency} {formatPrice(final_price)}
              </p>
            </div>
            {hasSavings && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <p className="text-xs text-blue-100">You saved</p>
                <p className="font-bold text-sm">
                  {currency} {formatPrice(total_discount)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {hasSavings && (
          <div className="text-center pt-2">
            <p className="text-green-600 text-sm font-medium flex items-center justify-center">
              <Icon icon="mdi:check-circle" className="w-4 h-4 mr-1.5" />
              🎉 Great deal! You're saving{" "}
              {Math.round((total_discount / base_price) * 100)}% on this booking
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountBreakdown;
