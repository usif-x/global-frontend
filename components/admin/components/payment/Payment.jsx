"use client";
import { Icon } from "@iconify/react";

const PaymentsContent = () => {
  const handleOpenDashboard = () => {
    window.open("https://www.easykash.net/seller/dashboard", "_blank");
  };

  return (
    <div className=" min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Icon icon="mdi:cash-multiple" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Payment Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Access your payment provider dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Link Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Icon icon="mdi:shield-check" className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">EasyKash Dashboard</h2>
                </div>
                <p className="text-cyan-50 text-sm max-w-md">
                  Access your complete payment analytics, transaction history,
                  withdrawals, and more through the payment provider dashboard.
                </p>
              </div>
              <div className="hidden md:block">
                <Icon icon="mdi:bank" className="w-24 h-24 opacity-20" />
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Login Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Icon
                  icon="mdi:information"
                  className="w-5 h-5 text-blue-600"
                />
                Login Instructions
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">
                      Use the following phone number to login:
                    </p>
                    <div className="mt-2 flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-slate-200">
                      <Icon
                        icon="mdi:phone"
                        className="w-5 h-5 text-cyan-600"
                      />
                      <span className="text-xl font-bold text-slate-800 font-mono">
                        01070440861
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">
                      The payment provider will send an OTP (One-Time Password)
                      to complete the login process.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">
                      Enter the OTP you receive to access the dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Access Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleOpenDashboard}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <Icon icon="mdi:open-in-new" className="w-6 h-6" />
                <span>Open Payment Dashboard</span>
                <Icon icon="mdi:arrow-right" className="w-5 h-5" />
              </button>
              <p className="text-sm text-slate-500 mt-3">
                Opens in a new tab: https://www.easykash.net/seller/dashboard
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <Icon
                  icon="mdi:chart-line"
                  className="w-5 h-5 text-cyan-600 mt-0.5"
                />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Payment Analytics
                  </h4>
                  <p className="text-xs text-slate-600">
                    View detailed revenue reports and trends
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <Icon
                  icon="mdi:format-list-bulleted"
                  className="w-5 h-5 text-cyan-600 mt-0.5"
                />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Transaction History
                  </h4>
                  <p className="text-xs text-slate-600">
                    Access all payment transactions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <Icon
                  icon="mdi:cash-check"
                  className="w-5 h-5 text-cyan-600 mt-0.5"
                />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Withdrawals
                  </h4>
                  <p className="text-xs text-slate-600">
                    Manage and process withdrawals
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <Icon icon="mdi:cog" className="w-5 h-5 text-cyan-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Settings
                  </h4>
                  <p className="text-xs text-slate-600">
                    Configure payment preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-6">
          <div className="flex items-start gap-3">
            <Icon
              icon="mdi:help-circle"
              className="w-6 h-6 text-blue-500 flex-shrink-0"
            />
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-600">
                If you're having trouble accessing the dashboard or need
                assistance with payment management, please contact the EasyKash
                support team or check their documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsContent;
