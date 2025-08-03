// pages/terms-and-conditions.js
"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

const TermsAndConditions = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: "booking",
      title: "Booking Terms & Payment Policy",
      icon: "solar:card-bold",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="font-medium text-blue-900">Contract Agreement</p>
            <p className="text-blue-800 mt-1">
              The contract is stipulated between you and "Global Divers"
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                Pricing & Packages
              </h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• All prices listed in Euros, per person</li>
                <li>• Dive packages are personal and non-transferable</li>
                <li>• Online prices require full payment 2+ days in advance</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                Service Guarantee
              </h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Full description provided via email voucher</li>
                <li>• Print and present voucher at check-in</li>
                <li>• Additional charges settled online or on-site</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
            <p className="font-medium text-amber-900 flex items-center gap-2">
              <Icon icon="solar:danger-circle-bold" className="w-4 h-4" />
              Price Changes
            </p>
            <p className="text-amber-800 mt-1 text-sm">
              Global Divers reserves the right to change prices due to local
              taxes or governmental fees. Your booking remains valid at the
              original price if paid in advance.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "prerequisites",
      title: "Diving Prerequisites & Requirements",
      icon: "solar:users-group-two-rounded-bold",
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <p className="font-medium text-red-900 flex items-center gap-2">
              <Icon icon="solar:shield-check-bold" className="w-4 h-4" />
              Your Responsibility
            </p>
            <p className="text-red-800 mt-1 text-sm">
              Ensure you meet all prerequisites for your certification level and
              logged dives.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Required Documentation
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Certification Card
                    </p>
                    <p className="text-gray-600 text-sm">
                      Valid international scuba diving certification required at
                      check-in
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Medical Certificate
                    </p>
                    <p className="text-gray-600 text-sm">
                      Required for specific medical conditions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Medical Disclaimer Form
                    </p>
                    <p className="text-gray-600 text-sm">
                      Must be completed at check-in (downloadable from booking
                      page)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="font-medium text-yellow-900">
                Important Medical Notice
              </p>
              <p className="text-yellow-800 text-sm mt-1">
                If any medical form questions are marked "yes", you'll need
                physician clearance. Failure to provide required medical
                documentation results in activity exclusion and 10% cancellation
                fee.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "cancellation",
      title: "Changes & Cancellation Policy",
      icon: "solar:calendar-bold",
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-900 mb-2">
              Booking Changes
            </h4>
            <p className="text-green-800 text-sm">
              We accommodate changes with 24-hour notice. Name changes allowed
              for "unforeseen circumstances" with conditions unchanged.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:swimming-bold"
                  className="w-4 h-4 text-blue-500"
                />
                Scuba Diving/Courses
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">15+ days before:</span>
                  <span className="font-medium">€50 fixed fee</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">14-5 days before:</span>
                  <span className="font-medium">10% of total</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">4-2 days before:</span>
                  <span className="font-medium">30% of total</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Less than 2 days:</span>
                  <span className="font-medium text-red-600">50% of total</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:home-2-bold"
                  className="w-4 h-4 text-purple-500"
                />
                Dive & Stay Packages
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">15+ days before:</span>
                  <span className="font-medium">€50 fixed fee</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">14-8 days before:</span>
                  <span className="font-medium">50% of total</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">7-1 days before:</span>
                  <span className="font-medium text-orange-600">
                    75% of total
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">No show:</span>
                  <span className="font-medium text-red-600">100% charged</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Diving Center Cancellations
            </h4>
            <p className="text-blue-800 text-sm mb-3">
              For unforeseen circumstances beyond our control (weather,
              equipment failure, strikes, etc.), we will:
            </p>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• Provide alternative equivalent service if available</p>
              <p>
                • Partial service delivery with refund for unrealized services
              </p>
              <p>• Complete refund of total amount</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "general-rules",
      title: "General Rules & Safety",
      icon: "solar:shield-star-bold",
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <h4 className="font-semibold text-orange-900 mb-2">
                Refresher Dive Recommendation
              </h4>
              <p className="text-orange-800 text-sm">
                Strongly recommended for safety and enjoyment. Required if you
                haven't dived for 6+ months, regardless of certification level.
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="font-semibold text-red-900 mb-2">
                Diving Insurance
              </h4>
              <p className="text-red-800 text-sm">
                Obligatory unless already insured. Copy must be presented at
                front office during check-in.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Weather & Marine Conditions
            </h4>
            <p className="text-gray-700 text-sm">
              Activities may be cancelled due to adverse weather/sea conditions
              or existing dangers. We'll minimize disruption but are not
              responsible for weather-related interruptions.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">
              Behavioral Standards
            </h4>
            <p className="text-yellow-800 text-sm">
              Disrespectful behavior or actions damaging others' tranquility may
              result in service refusal without refund. We reserve the right to
              refuse/interrupt activities for environmental non-compliance.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "complaints",
      title: "Complaints & Contact",
      icon: "solar:letter-bold",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Complaint Process
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                1. Report issues immediately to the on-site Diving Center
                manager
              </p>
              <p>
                2. For unresolved issues, send written complaint within 21 days
                to:
              </p>
              <p className="font-mono bg-white px-2 py-1 rounded border">
                info@globaldivershurghada.com
              </p>
              <p>3. We'll respond within 7 working days via email</p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">
              Our Commitment
            </h4>
            <p className="text-green-800 text-sm">
              We assume responsibility when our organization or activities don't
              meet brochure standards due to our fault. We're not responsible
              for issues caused by non-compliance with safety rules or
              unforeseeable events.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Website Copyright
            </h4>
            <p className="text-gray-700 text-sm">
              Global Divers owns all website content copyright. Access doesn't
              authorize copying or distribution of materials.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 mt-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon
                  icon="solar:swimming-bold"
                  className="w-6 h-6 text-white"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Global Divers
                </h1>
                <p className="text-gray-600 text-sm">Terms & Conditions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Terms & Conditions
            </h2>
            <p className="text-gray-600">
              Please read these terms carefully before booking your diving
              experience with us.
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                      <Icon icon={section.icon} className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  <Icon
                    icon={
                      expandedSections[section.id]
                        ? "solar:alt-arrow-down-bold"
                        : "solar:alt-arrow-right-bold"
                    }
                    className="w-5 h-5 text-gray-500"
                  />
                </button>

                {expandedSections[section.id] && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">{section.content}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 bg-gray-900 rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold mb-2">
              Questions about our terms?
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Contact us for clarification on any of these terms and conditions.
            </p>
            <a
              href="mailto:info@globaldivershurghada.com"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Icon icon="solar:letter-bold" className="w-4 h-4" />
              info@globaldivershurghada.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
