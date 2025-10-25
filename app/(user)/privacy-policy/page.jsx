// pages/privacy-policy.js
"use client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: "solar:database-bold",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:user-plus-bold" className="w-4 h-4" />
              Account Registration Information
            </h4>
            <p className="text-blue-800 text-sm mb-3">
              When you create an account with Top Divers, we collect the
              following personal information:
            </p>
            <div className="bg-white p-3 rounded border">
              <ul className="text-blue-800 text-sm space-y-1">
                <li>
                  <strong>Name:</strong> Your full name for account
                  identification and booking purposes
                </li>
                <li>
                  <strong>Email Address:</strong> Used for account verification,
                  communications, and booking confirmations
                </li>
                <li>
                  <strong>Password:</strong> Encrypted and stored securely to
                  protect your account access
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Icon icon="solar:bookmark-bold" className="w-4 h-4" />
                Booking Information
              </h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Diving certification details</li>
                <li>• Medical certificate information</li>
                <li>• Emergency contact details</li>
                <li>• Diving experience and preferences</li>
                <li>• Payment and billing information</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Icon icon="solar:chart-bold" className="w-4 h-4" />
                Technical Information
              </h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• IP address and location data</li>
                <li>• Browser type and version</li>
                <li>• Device information</li>
                <li>• Website usage patterns</li>
                <li>• Cookies and similar technologies</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="font-medium text-amber-900 flex items-center gap-2">
              <Icon icon="solar:shield-warning-bold" className="w-4 h-4" />
              Data Minimization
            </p>
            <p className="text-amber-800 text-sm mt-1">
              We only collect information that is necessary for providing our
              diving services and maintaining your account security.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "how-we-use-info",
      title: "How We Use Your Information",
      icon: "solar:settings-bold",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-900 mb-2">
                Primary Uses
              </h4>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 mt-0.5 text-green-600"
                  />
                  <span>
                    <strong>Account Management:</strong> Creating, maintaining,
                    and securing your user account
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 mt-0.5 text-green-600"
                  />
                  <span>
                    <strong>Booking Services:</strong> Processing dive bookings,
                    course registrations, and payments
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 mt-0.5 text-green-600"
                  />
                  <span>
                    <strong>Communication:</strong> Sending booking
                    confirmations, updates, and important notices
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 mt-0.5 text-green-600"
                  />
                  <span>
                    <strong>Safety & Compliance:</strong> Verifying diving
                    certifications and medical requirements
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-900 mb-2">
                Secondary Uses
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:star-bold"
                    className="w-4 h-4 mt-0.5 text-blue-600"
                  />
                  <span>
                    <strong>Service Improvement:</strong> Analyzing usage
                    patterns to enhance our platform
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:star-bold"
                    className="w-4 h-4 mt-0.5 text-blue-600"
                  />
                  <span>
                    <strong>Marketing:</strong> Sending promotional offers and
                    diving course updates (with consent)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:star-bold"
                    className="w-4 h-4 mt-0.5 text-blue-600"
                  />
                  <span>
                    <strong>Customer Support:</strong> Responding to inquiries
                    and resolving issues
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    icon="solar:star-bold"
                    className="w-4 h-4 mt-0.5 text-blue-600"
                  />
                  <span>
                    <strong>Legal Compliance:</strong> Meeting regulatory
                    requirements and safety standards
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">
              Legal Basis for Processing
            </h4>
            <p className="text-purple-800 text-sm">
              We process your personal data based on legitimate interests,
              contract performance, legal obligations, and your explicit consent
              where required.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "data-security",
      title: "Data Security & Protection",
      icon: "solar:shield-check-bold",
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:lock-password-bold" className="w-4 h-4" />
              Password Security
            </h4>
            <div className="text-red-800 text-sm space-y-1">
              <p>
                • Passwords are encrypted using industry-standard hashing
                algorithms
              </p>
              <p>• We never store or have access to your plain-text password</p>
              <p>
                • Strong password requirements are enforced during registration
              </p>
              <p>
                • Account lockout mechanisms protect against brute force attacks
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Icon icon="solar:server-bold" className="w-4 h-4" />
                Technical Safeguards
              </h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• SSL/TLS encryption for data transmission</li>
                <li>• Secure database storage with encryption</li>
                <li>• Regular security updates and patches</li>
                <li>• Firewall protection and intrusion detection</li>
                <li>• Regular security audits and monitoring</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="w-4 h-4"
                />
                Access Controls
              </h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Limited staff access on need-to-know basis</li>
                <li>• Employee background checks and training</li>
                <li>• Two-factor authentication for admin accounts</li>
                <li>• Regular access reviews and updates</li>
                <li>• Secure data disposal procedures</li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2">
              Data Breach Response
            </h4>
            <p className="text-orange-800 text-sm">
              In the unlikely event of a data breach, we will notify affected
              users within 72 hours and take immediate steps to secure the
              compromised data and prevent further unauthorized access.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "data-sharing",
      title: "Data Sharing & Third Parties",
      icon: "solar:share-bold",
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-900 mb-2">
              Our Commitment
            </h4>
            <p className="text-yellow-800 text-sm">
              We do not sell, rent, or trade your personal information to third
              parties for marketing purposes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                When We May Share Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon
                    icon="solar:hand-money-bold"
                    className="w-5 h-5 text-blue-500 mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      Payment Processing
                    </p>
                    <p className="text-gray-600 text-sm">
                      Secure payment processors to handle transactions (credit
                      card details are never stored on our servers)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon
                    icon="solar:mailbox-bold"
                    className="w-5 h-5 text-green-500 mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Email Services</p>
                    <p className="text-gray-600 text-sm">
                      Trusted email service providers for sending booking
                      confirmations and communications
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon
                    icon="solar:chart-2-bold"
                    className="w-5 h-5 text-purple-500 mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      Analytics Services
                    </p>
                    <p className="text-gray-600 text-sm">
                      Anonymized data for website analytics and service
                      improvement
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon
                    icon="ph:court-basketball-duotone"
                    className="w-5 h-5 text-red-500 mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      Legal Requirements
                    </p>
                    <p className="text-gray-600 text-sm">
                      When required by law, court order, or to protect our legal
                      rights and safety
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">
                Third-Party Safeguards
              </h4>
              <p className="text-green-800 text-sm">
                All third-party service providers are contractually bound to
                protect your data and use it only for the specified purposes.
                They cannot use your information for their own marketing or
                other purposes.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "your-rights",
      title: "Your Privacy Rights",
      icon: "solar:user-check-bold",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 mb-2">
              Under GDPR and Similar Laws
            </h4>
            <p className="text-blue-800 text-sm">
              You have the following rights regarding your personal data:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 flex items-center gap-2 mb-1">
                  <Icon
                    icon="solar:eye-bold"
                    className="w-4 h-4 text-blue-500"
                  />
                  Right to Access
                </h5>
                <p className="text-gray-600 text-sm">
                  Request a copy of all personal data we hold about you
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 flex items-center gap-2 mb-1">
                  <Icon
                    icon="solar:pen-bold"
                    className="w-4 h-4 text-green-500"
                  />
                  Right to Rectification
                </h5>
                <p className="text-gray-600 text-sm">
                  Correct inaccurate or incomplete personal information
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 flex items-center gap-2 mb-1">
                  <Icon
                    icon="solar:trash-bin-minimalistic-bold"
                    className="w-4 h-4 text-red-500"
                  />
                  Right to Erasure
                </h5>
                <p className="text-gray-600 text-sm">
                  Request deletion of your personal data under certain
                  conditions
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 flex items-center gap-2 mb-1">
                  <Icon
                    icon="solar:download-minimalistic-bold"
                    className="w-4 h-4 text-purple-500"
                  />
                  Right to Portability
                </h5>
                <p className="text-gray-600 text-sm">
                  Receive your data in a structured, machine-readable format
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 flex items-center gap-2 mb-1">
                  <Icon
                    icon="solar:forbidden-circle-bold"
                    className="w-4 h-4 text-orange-500"
                  />
                  Right to Object
                </h5>
                <p className="text-gray-600 text-sm">
                  Object to processing based on legitimate interests or for
                  marketing
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 flex items-center gap-2 mb-1">
                  <Icon
                    icon="solar:pause-bold"
                    className="w-4 h-4 text-yellow-500"
                  />
                  Right to Restrict
                </h5>
                <p className="text-gray-600 text-sm">
                  Limit how we process your data under certain circumstances
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              How to Exercise Your Rights
            </h4>
            <p className="text-gray-700 text-sm mb-2">
              To exercise any of these rights, please contact us at:
            </p>
            <div className="bg-white p-3 rounded border">
              <p className="font-mono text-sm text-gray-800">
                contact@topdivers.online
              </p>
            </div>
            <p className="text-gray-600 text-xs mt-2">
              We will respond to your request within 30 days and may require
              verification of your identity.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "cookies",
      title: "Cookies & Tracking",
      icon: "fluent:cookies-28-filled",
      content: (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
            <h4 className="font-semibold text-amber-900 mb-2">
              What Are Cookies?
            </h4>
            <p className="text-amber-800 text-sm">
              Cookies are small text files stored on your device when you visit
              our website. They help us provide you with a better browsing
              experience and remember your preferences.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Types of Cookies We Use
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Essential Cookies
                    </p>
                    <p className="text-gray-600 text-sm">
                      Required for website functionality, login sessions, and
                      security
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Functional Cookies
                    </p>
                    <p className="text-gray-600 text-sm">
                      Remember your preferences and settings for a personalized
                      experience
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Analytics Cookies
                    </p>
                    <p className="text-gray-600 text-sm">
                      Help us understand how visitors use our website to improve
                      our services
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Marketing Cookies
                    </p>
                    <p className="text-gray-600 text-sm">
                      Used to deliver relevant advertisements (only with your
                      consent)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Cookie Control
              </h4>
              <p className="text-blue-800 text-sm mb-2">
                You can control and manage cookies in several ways:
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>
                  • Use our cookie consent banner to choose your preferences
                </li>
                <li>
                  • Adjust your browser settings to block or delete cookies
                </li>
                <li>• Use private/incognito browsing mode</li>
                <li>• Contact us to opt-out of non-essential cookies</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "data-retention",
      title: "Data Retention & Deletion",
      icon: "solar:calendar-search-bold",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 mb-2">
              Retention Periods
            </h4>
            <p className="text-blue-800 text-sm">
              We retain your personal data only as long as necessary for the
              purposes outlined in this policy.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Specific Retention Periods
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Active user accounts:</span>
                  <span className="font-medium">
                    Retained while account is active
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Inactive accounts:</span>
                  <span className="font-medium">
                    Deleted after 3 years of inactivity
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Booking records:</span>
                  <span className="font-medium">
                    7 years (legal requirement)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Payment information:</span>
                  <span className="font-medium">
                    As required by payment processors
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Marketing consent:</span>
                  <span className="font-medium">
                    Until withdrawn or 2 years
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">
                Account Deletion
              </h4>
              <p className="text-green-800 text-sm mb-2">
                You can request account deletion at any time. Upon deletion:
              </p>
              <ul className="text-green-700 text-sm space-y-1">
                <li>
                  • Personal data is permanently removed from our active systems
                </li>
                <li>
                  • Some information may be retained in backups for up to 90
                  days
                </li>
                <li>
                  • Legal and compliance records may be retained as required by
                  law
                </li>
                <li>
                  • Anonymous analytics data may be retained for service
                  improvement
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "contact-updates",
      title: "Contact & Policy Updates",
      icon: "solar:letter-unread-bold",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 mb-2">
              Data Protection Contact
            </h4>
            <div className="text-blue-800 text-sm space-y-2">
              <p>
                For any privacy-related questions or concerns, please contact:
              </p>
              <div className="bg-white p-3 rounded border space-y-1">
                <p>
                  <strong>Email:</strong> contact@topdivers.online
                </p>
                <p>
                  <strong>Subject Line:</strong> Privacy Policy Inquiry
                </p>
                <p>
                  <strong>Response Time:</strong> Within 72 hours
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2">
              Policy Updates
            </h4>
            <div className="text-orange-800 text-sm space-y-2">
              <p>
                We may update this privacy policy from time to time to reflect:
              </p>
              <ul className="space-y-1 ml-4">
                <li>• Changes in our services or business practices</li>
                <li>• New legal requirements or regulations</li>
                <li>• Improvements to our security measures</li>
                <li>• User feedback and requests</li>
              </ul>
              <p className="mt-2">
                We will notify users of significant changes via email or website
                notification.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg text-white">
            <h4 className="font-semibold mb-2">Effective Date</h4>
            <p className="text-gray-300 text-sm">
              This privacy policy is effective as of January 1, 2024
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Last updated: January 1, 2024
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 mt-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Icon
                  icon="solar:shield-user-bold"
                  className="w-6 h-6 text-white"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Top Divers</h1>
                <p className="text-gray-600 text-sm">Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Privacy Policy
            </h2>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your personal information.
            </p>

            <div className="bg-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:info-circle-bold" className="w-5 h-5" />
                <span className="font-semibold">Quick Summary</span>
              </div>
              <p className="text-blue-100 text-sm">
                We collect your name, email, and password for account creation.
                We use this information to provide diving services, ensure
                safety compliance, and communicate with you. We never sell your
                data and use industry-standard security measures.
              </p>
            </div>
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
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-200 transition-colors">
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
          <div className="mt-12 bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-6 text-center text-white">
            <h3 className="font-semibold mb-2">
              Questions about your privacy?
            </h3>
            <p className="text-purple-100 text-sm mb-4">
              We're here to help you understand how we protect your personal
              information.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:contact@topdivers.online"
                className="inline-flex items-center gap-2 bg-white text-purple-900 px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                <Icon icon="solar:letter-bold" className="w-4 h-4" />
                contact@topdivers.online
              </a>
              <Link
                href="/terms-and-conditions"
                className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                <Icon icon="solar:document-text-bold" className="w-4 h-4" />
                Terms & Conditions
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Icon
                icon="solar:shield-check-bold"
                className="w-8 h-8 text-green-500 mx-auto mb-2"
              />
              <h4 className="font-semibold text-gray-900 text-sm">
                GDPR Compliant
              </h4>
              <p className="text-gray-600 text-xs">
                Full compliance with EU data protection regulations
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Icon
                icon="solar:lock-password-bold"
                className="w-8 h-8 text-blue-500 mx-auto mb-2"
              />
              <h4 className="font-semibold text-gray-900 text-sm">
                Secure Encryption
              </h4>
              <p className="text-gray-600 text-xs">
                Industry-standard security measures protect your data
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Icon
                icon="solar:user-check-bold"
                className="w-8 h-8 text-purple-500 mx-auto mb-2"
              />
              <h4 className="font-semibold text-gray-900 text-sm">
                Your Control
              </h4>
              <p className="text-gray-600 text-xs">
                Easy access to view, update, or delete your information
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
