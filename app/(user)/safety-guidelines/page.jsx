"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

const SafetyGuidelines = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: "pre-dive-safety",
      title: "Pre-Dive Safety Requirements",
      icon: "solar:clipboard-check-bold",
      color: "blue",
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:health-bold" className="w-4 h-4" />
              Medical Fitness Requirements
            </h4>
            <div className="text-red-800 text-sm space-y-2">
              <p>
                <strong>Mandatory Medical Declaration:</strong> All divers must
                complete and sign a medical questionnaire before diving.
              </p>
              <p>
                <strong>Medical Certificate:</strong> Required if you answer
                "YES" to any medical questions or have specific conditions.
              </p>
              <p>
                <strong>Age Restrictions:</strong> Minimum age 10 for Discover
                Scuba Diving, 12 for Open Water certification.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:medal-ribbons-star-bold"
                  className="w-4 h-4 text-gold-500"
                />
                Certification Requirements
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>
                    Valid diving certification card (C-card) must be presented
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>
                    Certification level must match planned dive activities
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>
                    Recent diving experience within the last 6 months
                    recommended
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>
                    Refresher course required if inactive for 6+ months
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:shield-plus-bold"
                  className="w-4 h-4 text-blue-500"
                />
                Insurance & Documentation
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:document-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Valid diving insurance policy required</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:document-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Copy of insurance certificate must be provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:document-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Valid photo ID (passport/driver's license)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:document-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Emergency contact information</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
              No-Fly Rule
            </h4>
            <p className="text-orange-800 text-sm">
              Do not fly for at least 18 hours after recreational diving, or 24
              hours after multiple dives or decompression diving. Plan your
              flights accordingly.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "diving-protocols",
      title: "Diving Safety Protocols",
      icon: "solar:swimming-bold",
      color: "green",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 mb-2">
              Buddy System Protocol
            </h4>
            <p className="text-blue-800 text-sm mb-2">
              Never dive alone. The buddy system is mandatory for all dives.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>
                • Stay within arm's reach of your buddy throughout the dive
              </li>
              <li>
                • Establish communication signals before entering the water
              </li>
              <li>• Monitor your buddy's air supply and diving behavior</li>
              <li>• Surface together and maintain visual contact</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:speedometer-bold"
                  className="w-4 h-4 text-red-500"
                />
                Depth & Time Limits
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Open Water Divers:</span>
                  <span className="font-medium">18m / 60ft max</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Advanced Divers:</span>
                  <span className="font-medium">30m / 100ft max</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Deep Specialty:</span>
                  <span className="font-medium">40m / 130ft max</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">No-Decompression:</span>
                  <span className="font-medium">
                    Follow dive tables/computer
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:gas-station-bold"
                  className="w-4 h-4 text-yellow-500"
                />
                Air Management Rules
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:arrow-up-bold"
                    className="w-3 h-3 text-green-500 mt-1"
                  />
                  <span>
                    <strong>Surface with reserve:</strong> 50 bar / 700 psi
                    minimum
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:arrow-up-bold"
                    className="w-3 h-3 text-orange-500 mt-1"
                  />
                  <span>
                    <strong>Turn dive at:</strong> 100 bar / 1500 psi or 1/3 of
                    air
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:eye-bold"
                    className="w-3 h-3 text-blue-500 mt-1"
                  />
                  <span>
                    <strong>Check gauges:</strong> Every 5-10 minutes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:users-group-rounded-bold"
                    className="w-3 h-3 text-purple-500 mt-1"
                  />
                  <span>
                    <strong>Communicate:</strong> Air levels with buddy
                    regularly
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:arrow-up-bold" className="w-4 h-4" />
              Ascent & Safety Stop Procedures
            </h4>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <p className="font-medium text-green-800 text-sm mb-1">
                  Controlled Ascent Rate:
                </p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Maximum 18m/60ft per minute</li>
                  <li>• Slower ascent in final 6m/20ft</li>
                  <li>• Watch dive computer for guidance</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-green-800 text-sm mb-1">
                  Safety Stop (Mandatory):
                </p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• 3-5 minutes at 5m/15ft depth</li>
                  <li>• Required for all dives deeper than 12m/40ft</li>
                  <li>• Extend if diving to maximum limits</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "equipment-safety",
      title: "Equipment Safety & Inspection",
      icon: "solar:settings-bold",
      color: "purple",
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Icon
                icon="solar:checklist-minimalistic-bold"
                className="w-4 h-4"
              />
              Pre-Dive Equipment Check
            </h4>
            <p className="text-purple-800 text-sm mb-3">
              Always perform a thorough equipment inspection before every dive
              using the BWRAF method:
            </p>
            <div className="bg-white p-3 rounded border">
              <div className="grid md:grid-cols-5 gap-3 text-sm">
                <div className="text-center">
                  <Icon
                    icon="solar:swimming-bold"
                    className="w-6 h-6 mx-auto text-blue-500 mb-1"
                  />
                  <p className="font-medium text-gray-900">BCD</p>
                  <p className="text-gray-600 text-xs">Inflate/deflate test</p>
                </div>
                <div className="text-center">
                  <Icon
                    icon="solar:scale-bold"
                    className="w-6 h-6 mx-auto text-green-500 mb-1"
                  />
                  <p className="font-medium text-gray-900">Weights</p>
                  <p className="text-gray-600 text-xs">Secure & releasable</p>
                </div>
                <div className="text-center">
                  <Icon
                    icon="solar:gas-station-bold"
                    className="w-6 h-6 mx-auto text-red-500 mb-1"
                  />
                  <p className="font-medium text-gray-900">Releases</p>
                  <p className="text-gray-600 text-xs">
                    Weight & tank releases
                  </p>
                </div>
                <div className="text-center">
                  <Icon
                    icon="healthicons:oxygen-tank-24px"
                    className="w-6 h-6 mx-auto text-orange-500 mb-1"
                  />
                  <p className="font-medium text-gray-900">Air</p>
                  <p className="text-gray-600 text-xs">Test both regulators</p>
                </div>
                <div className="text-center">
                  <Icon
                    icon="solar:hand-shake-bold"
                    className="w-6 h-6 mx-auto text-purple-500 mb-1"
                  />
                  <p className="font-medium text-gray-900">Final OK</p>
                  <p className="text-gray-600 text-xs">Buddy check complete</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:shield-keyhole-minimalistic-bold"
                  className="w-4 h-4 text-blue-500"
                />
                Equipment Maintenance
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:water-drop-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>
                    Rinse all equipment with fresh water after each dive
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:sun-bold"
                    className="w-4 h-4 text-yellow-500 mt-0.5"
                  />
                  <span>Dry equipment thoroughly before storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:tools-bold"
                    className="w-4 h-4 text-gray-500 mt-0.5"
                  />
                  <span>Regular professional servicing every 12 months</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:eye-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Visual inspection before every use</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:danger-triangle-bold"
                  className="w-4 h-4 text-red-500"
                />
                Equipment Red Flags
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-4 h-4 text-red-500 mt-0.5"
                  />
                  <span>Cracked or damaged masks/fins</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-4 h-4 text-red-500 mt-0.5"
                  />
                  <span>Regulators that breathe hard or free-flow</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-4 h-4 text-red-500 mt-0.5"
                  />
                  <span>BCD that won't hold air or inflate properly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-4 h-4 text-red-500 mt-0.5"
                  />
                  <span>Tanks with low pressure or damaged valves</span>
                </li>
              </ul>
              <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                <p className="text-red-800 text-xs font-medium">
                  ⚠️ Never dive with faulty equipment. Report issues
                  immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2">
              Equipment Responsibility
            </h4>
            <p className="text-amber-800 text-sm">
              While Top Divers maintains all rental equipment to the highest
              standards, divers are responsible for conducting pre-dive safety
              checks and reporting any equipment issues immediately.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "emergency-procedures",
      title: "Emergency Procedures",
      icon: "solar:siren-bold",
      color: "red",
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-red-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:health-bold"
                  className="w-4 h-4 text-red-500"
                />
                Diving Emergencies
              </h4>
              <div className="space-y-3 text-sm">
                <div className="border-l-3 border-red-400 pl-3">
                  <p className="font-medium text-red-900">
                    Decompression Sickness (DCS)
                  </p>
                  <p className="text-red-700 text-xs">
                    Joint pain, fatigue, dizziness, skin rash
                  </p>
                  <p className="text-red-600 text-xs">
                    → 100% oxygen, emergency evacuation
                  </p>
                </div>
                <div className="border-l-3 border-orange-400 pl-3">
                  <p className="font-medium text-orange-900">
                    Arterial Gas Embolism
                  </p>
                  <p className="text-orange-700 text-xs">
                    Sudden unconsciousness, paralysis
                  </p>
                  <p className="text-orange-600 text-xs">
                    → Immediate hyperbaric treatment
                  </p>
                </div>
                <div className="border-l-3 border-blue-400 pl-3">
                  <p className="font-medium text-blue-900">Near Drowning</p>
                  <p className="text-blue-700 text-xs">
                    Unconscious diver, water in lungs
                  </p>
                  <p className="text-blue-600 text-xs">
                    → CPR, emergency medical services
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-orange-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:hand-heart-bold"
                  className="w-4 h-4 text-orange-500"
                />
                First Aid Procedures
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span className="text-gray-700">
                    Ensure scene safety and call for help
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span className="text-gray-700">
                    Check consciousness and breathing
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span className="text-gray-700">
                    Administer 100% oxygen if available
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span className="text-gray-700">
                    Begin CPR if no pulse/breathing
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    5
                  </span>
                  <span className="text-gray-700">
                    Monitor vitals until help arrives
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:map-point-bold" className="w-4 h-4" />
              Emergency Action Plan
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-yellow-800 mb-1">
                  At the Dive Site:
                </p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Signal dive boat immediately</li>
                  <li>• Remove diver from water safely</li>
                  <li>• Provide first aid and oxygen</li>
                  <li>• Prepare for evacuation</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-yellow-800 mb-1">
                  Communication:
                </p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Call emergency services (122)</li>
                  <li>• Contact diving emergency hotline</li>
                  <li>• Notify hyperbaric chamber</li>
                  <li>• Update Top Divers staff</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-yellow-800 mb-1">
                  Documentation:
                </p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Record dive profile details</li>
                  <li>• Note symptoms and timeline</li>
                  <li>• Preserve dive computer data</li>
                  <li>• Gather witness statements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "environmental-safety",
      title: "Environmental & Marine Safety",
      icon: "solar:leaf-bold",
      color: "green",
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:fish-bold" className="w-4 h-4" />
              Marine Life Interaction Guidelines
            </h4>
            <p className="text-green-800 text-sm mb-3">
              Respect marine life and maintain safe distances to protect both
              yourself and the underwater ecosystem:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium text-green-900 text-sm mb-2">
                  Safe Practices:
                </h5>
                <ul className="text-green-700 text-xs space-y-1">
                  <li>• Look but don't touch marine life</li>
                  <li>• Maintain neutral buoyancy to avoid coral damage</li>
                  <li>• Keep hands close to your body</li>
                  <li>• Move slowly and calmly underwater</li>
                  <li>• Never feed fish or marine animals</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium text-red-900 text-sm mb-2">
                  Dangerous Species:
                </h5>
                <ul className="text-red-700 text-xs space-y-1">
                  <li>• Stonefish and scorpionfish (venomous)</li>
                  <li>• Sea urchins (sharp spines)</li>
                  <li>• Jellyfish and fire coral (stinging)</li>
                  <li>• Moray eels (aggressive if threatened)</li>
                  <li>• Sharks (maintain respectful distance)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:weather-bold"
                  className="w-4 h-4 text-blue-500"
                />
                Weather & Water Conditions
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800 mb-1">
                    Safe Diving Conditions:
                  </p>
                  <ul className="text-gray-600 text-xs space-y-1">
                    <li>• Wind speed under 20 knots</li>
                    <li>• Wave height under 1.5 meters</li>
                    <li>• Visibility minimum 10 meters</li>
                    <li>• Water temperature above 20°C</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-red-800 mb-1">
                    Dive Cancellation Criteria:
                  </p>
                  <ul className="text-red-600 text-xs space-y-1">
                    <li>• Strong currents or rough seas</li>
                    <li>• Lightning or severe weather</li>
                    <li>• Poor visibility conditions</li>
                    <li>• Water temperature extremes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:recycle-bold"
                  className="w-4 h-4 text-green-500"
                />
                Environmental Protection
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:trash-bin-minimalistic-bold"
                    className="w-4 h-4 text-red-500 mt-0.5"
                  />
                  <span>Pack out all trash and debris</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:camera-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Take only photos, leave only bubbles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:leaf-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Use reef-safe sunscreen only</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:shield-network-bold"
                    className="w-4 h-4 text-purple-500 mt-0.5"
                  />
                  <span>Report marine life injuries or pollution</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:water-bold" className="w-4 h-4" />
              Red Sea Specific Hazards
            </h4>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="font-medium text-blue-800 mb-1">Marine Life:</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• Red Sea coral (sharp and fragile)</li>
                  <li>• Crown of thorns starfish</li>
                  <li>• Blue-spotted stingray</li>
                  <li>• Titan triggerfish (territorial)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-800 mb-1">Environmental:</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• Strong thermal layers</li>
                  <li>• Occasional strong currents</li>
                  <li>• Coral reef drop-offs</li>
                  <li>• High salinity water</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-800 mb-1">
                  Safety Measures:
                </p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• Wear protective gloves when needed</li>
                  <li>• Maintain proper buoyancy control</li>
                  <li>• Follow dive guide instructions</li>
                  <li>• Stay within certification limits</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "dive-planning",
      title: "Dive Planning & Risk Management",
      icon: "solar:compass-bold",
      color: "indigo",
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:map-bold" className="w-4 h-4" />
              Pre-Dive Planning Checklist
            </h4>
            <p className="text-indigo-800 text-sm mb-3">
              Proper planning is essential for safe diving. Review all aspects
              before entering the water:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:target-bold"
                  className="w-4 h-4 text-green-500"
                />
                Dive Site Assessment
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:eye-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Review dive site map and topography</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:speedometer-bold"
                    className="w-4 h-4 text-orange-500 mt-0.5"
                  />
                  <span>Check maximum depth and current conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:danger-triangle-bold"
                    className="w-4 h-4 text-red-500 mt-0.5"
                  />
                  <span>Identify potential hazards and exit points</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:fish-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Brief on marine life and points of interest</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="w-4 h-4 text-purple-500"
                />
                Team Communication
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:hand-shake-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Establish buddy teams and responsibilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:chat-round-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Review hand signals and communication</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:clock-circle-bold"
                    className="w-4 h-4 text-orange-500 mt-0.5"
                  />
                  <span>Agree on dive time and air limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:route-bold"
                    className="w-4 h-4 text-purple-500 mt-0.5"
                  />
                  <span>Plan dive route and navigation</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:calculator-bold" className="w-4 h-4" />
              Dive Computer & Tables
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-yellow-800 mb-2">
                  Dive Computer Best Practices:
                </p>
                <ul className="text-yellow-700 space-y-1 text-xs">
                  <li>• Set conservative decompression settings</li>
                  <li>• Check battery level before diving</li>
                  <li>• Never share computers between divers</li>
                  <li>• Have backup depth gauge and timing device</li>
                  <li>• Understand your computer's algorithms</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-yellow-800 mb-2">
                  Backup Planning:
                </p>
                <ul className="text-yellow-700 space-y-1 text-xs">
                  <li>• Plan dive using tables as backup</li>
                  <li>• Know maximum no-decompression limits</li>
                  <li>• Calculate surface intervals between dives</li>
                  <li>• Plan for deepest dive first</li>
                  <li>• Have emergency ascent procedures ready</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:shield-warning-bold" className="w-4 h-4" />
              Risk Assessment Matrix
            </h4>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="font-medium text-green-800 mb-1">
                  Low Risk Conditions:
                </p>
                <ul className="text-green-700 text-xs space-y-1">
                  <li>• Calm seas, good visibility</li>
                  <li>• Familiar dive site</li>
                  <li>• Experienced dive team</li>
                  <li>• Conservative dive plan</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-orange-800 mb-1">
                  Medium Risk Conditions:
                </p>
                <ul className="text-orange-700 text-xs space-y-1">
                  <li>• Moderate current or waves</li>
                  <li>• New dive site or team</li>
                  <li>• Equipment concerns</li>
                  <li>• Time pressure factors</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-red-800 mb-1">
                  High Risk - Consider Canceling:
                </p>
                <ul className="text-red-700 text-xs space-y-1">
                  <li>• Severe weather conditions</li>
                  <li>• Inexperienced or uncomfortable divers</li>
                  <li>• Equipment malfunctions</li>
                  <li>• Multiple risk factors present</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "snorkeling-safety",
      title: "Snorkeling Safety Guidelines",
      icon: "solar:swimming-bold",
      color: "cyan",
      content: (
        <div className="space-y-4">
          <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-500">
            <h4 className="font-semibold text-cyan-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:swimming-bold" className="w-4 h-4" />
              Snorkeling Safety Fundamentals
            </h4>
            <p className="text-cyan-800 text-sm mb-3">
              Snorkeling is a wonderful way to explore marine life, but it
              requires proper preparation and awareness. Follow these guidelines
              for a safe and enjoyable experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:health-bold"
                  className="w-4 h-4 text-green-500"
                />
                Pre-Snorkeling Requirements
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Basic swimming ability required</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>No medical conditions that prevent swimming</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Comfortable in water without flotation device</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>No recent alcohol consumption (2+ hours)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="w-4 h-4 text-blue-500"
                />
                Buddy System & Supervision
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:users-group-rounded-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Never snorkel alone - always use buddy system</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:eye-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Stay within sight of your buddy at all times</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:hand-shake-bold"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Establish hand signals before entering water</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="cil:child"
                    className="w-4 h-4 text-blue-500 mt-0.5"
                  />
                  <span>Children must be supervised by adults</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:settings-bold" className="w-4 h-4" />
              Equipment Safety & Fit
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-800 mb-2">
                  Mask & Snorkel:
                </p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Ensure mask fits properly with no leaks</li>
                  <li>• Test snorkel breathing before entering water</li>
                  <li>• Clear snorkel of water before breathing</li>
                  <li>• Keep snorkel above water when breathing</li>
                  <li>• Never hyperventilate through snorkel</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-800 mb-2">
                  Fins & Flotation:
                </p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Fins should fit snugly but not be tight</li>
                  <li>• Use flotation device if not confident swimmer</li>
                  <li>• Wear appropriate sun protection</li>
                  <li>
                    • Consider rash guard for sun and marine life protection
                  </li>
                  <li>• Test all equipment in shallow water first</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:weather-bold"
                  className="w-4 h-4 text-orange-500"
                />
                Weather & Water Conditions
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800 mb-1">
                    Safe Snorkeling Conditions:
                  </p>
                  <ul className="text-gray-600 text-xs space-y-1">
                    <li>• Calm seas with minimal waves</li>
                    <li>• Good visibility (5+ meters)</li>
                    <li>• Light to moderate currents</li>
                    <li>• Water temperature above 20°C</li>
                    <li>• No strong winds or storms</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-red-800 mb-1">
                    Avoid Snorkeling When:
                  </p>
                  <ul className="text-red-600 text-xs space-y-1">
                    <li>• Rough seas or strong currents</li>
                    <li>• Poor visibility conditions</li>
                    <li>• Thunderstorms or lightning</li>
                    <li>• High winds or choppy water</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon
                  icon="solar:fish-bold"
                  className="w-4 h-4 text-green-500"
                />
                Marine Life Safety
              </h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:eye-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Look but never touch marine life</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="streamline-plump:no-touch-sign-solid"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Keep hands close to your body</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="ion:fish"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Maintain safe distance from all animals</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:trash-bin-minimalistic-bold"
                    className="w-4 h-4 text-green-500 mt-0.5"
                  />
                  <span>Never feed fish or marine animals</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="solar:danger-triangle-bold"
                    className="w-4 h-4 text-red-500 mt-0.5"
                  />
                  <span>Avoid areas with jellyfish or dangerous species</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
              Snorkeling Techniques & Limits
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-yellow-800 mb-2">
                  Proper Techniques:
                </p>
                <ul className="text-yellow-700 space-y-1 text-xs">
                  <li>• Breathe slowly and deeply through snorkel</li>
                  <li>• Keep your head down and body horizontal</li>
                  <li>• Use gentle fin movements to avoid stirring sediment</li>
                  <li>• Take regular breaks to rest and hydrate</li>
                  <li>• Clear mask and snorkel as needed</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-yellow-800 mb-2">
                  Safety Limits:
                </p>
                <ul className="text-yellow-700 space-y-1 text-xs">
                  <li>• Stay in shallow water (max 3-5 meters depth)</li>
                  <li>• Don't hold your breath or dive down</li>
                  <li>• Limit sessions to 30-45 minutes</li>
                  <li>• Exit water if tired or cold</li>
                  <li>• Never snorkel in areas with boat traffic</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:siren-bold" className="w-4 h-4" />
              Emergency Procedures for Snorkelers
            </h4>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="font-medium text-red-800 mb-1">
                  If You're in Trouble:
                </p>
                <ul className="text-red-700 text-xs space-y-1">
                  <li>• Signal for help immediately</li>
                  <li>• Remove snorkel and breathe normally</li>
                  <li>• Float on your back to rest</li>
                  <li>• Stay calm and conserve energy</li>
                  <li>• Don't panic or make sudden movements</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-red-800 mb-1">
                  If Your Buddy Needs Help:
                </p>
                <ul className="text-red-700 text-xs space-y-1">
                  <li>• Call for assistance immediately</li>
                  <li>• Throw flotation device if available</li>
                  <li>• Guide them to shallow water</li>
                  <li>• Help them remove equipment if needed</li>
                  <li>• Stay with them until help arrives</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-red-800 mb-1">
                  Medical Emergencies:
                </p>
                <ul className="text-red-700 text-xs space-y-1">
                  <li>• Remove from water immediately</li>
                  <li>• Check breathing and consciousness</li>
                  <li>• Call emergency services (122)</li>
                  <li>• Begin CPR if necessary</li>
                  <li>• Keep warm and monitor condition</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Icon icon="solar:leaf-bold" className="w-4 h-4" />
              Environmental Protection for Snorkelers
            </h4>
            <p className="text-green-800 text-sm mb-3">
              Help protect the marine environment while enjoying your snorkeling
              experience:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium text-green-900 text-sm mb-2">
                  Do's:
                </h5>
                <ul className="text-green-700 text-xs space-y-1">
                  <li>• Use reef-safe sunscreen only</li>
                  <li>• Maintain neutral buoyancy</li>
                  <li>• Take only photos, leave only bubbles</li>
                  <li>• Respect marine protected areas</li>
                  <li>• Report environmental damage</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium text-red-900 text-sm mb-2">
                  Don'ts:
                </h5>
                <ul className="text-red-700 text-xs space-y-1">
                  <li>• Touch or stand on coral reefs</li>
                  <li>• Collect shells or marine life</li>
                  <li>• Use regular sunscreen (harmful to coral)</li>
                  <li>• Stir up sediment unnecessarily</li>
                  <li>• Leave any trash behind</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 mt-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Icon
                  icon="solar:shield-star-bold"
                  className="w-6 h-6 text-white"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Top Divers</h1>
                <p className="text-gray-600 text-sm">Safety Guidelines</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Diving and Snorkeling Safety Guidelines
            </h2>
            <p className="text-gray-600 mb-4">
              Your safety is our top priority. Please read and follow these
              comprehensive safety guidelines for all diving activities.
            </p>

            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:danger-triangle-bold" className="w-5 h-5" />
                <span className="font-semibold">Safety First Policy</span>
              </div>
              <p className="text-red-100 text-sm">
                All divers must comply with these safety guidelines. Failure to
                follow safety protocols may result in termination of diving
                activities without refund. When in doubt, ask your dive
                professional.
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
                    <div
                      className={`p-2 bg-${section.color}-100 rounded-lg text-${section.color}-600 group-hover:bg-${section.color}-200 transition-colors`}
                    >
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

          {/* Safety Certifications */}
          <div className="mt-8 grid md:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Icon
                icon="solar:medal-ribbons-star-bold"
                className="w-8 h-8 text-blue-500 mx-auto mb-2"
              />
              <h4 className="font-semibold text-gray-900 text-sm">
                PADI Standards
              </h4>
              <p className="text-gray-600 text-xs">
                Certified training facility
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Icon
                icon="solar:health-bold"
                className="w-8 h-8 text-green-500 mx-auto mb-2"
              />
              <h4 className="font-semibold text-gray-900 text-sm">
                First Aid Certified
              </h4>
              <p className="text-gray-600 text-xs">
                All staff trained in emergency response
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Icon
                icon="mdi:oxygen-tank"
                className="w-8 h-8 text-red-500 mx-auto mb-2"
              />
              <h4 className="font-semibold text-gray-900 text-sm">
                Emergency Oxygen
              </h4>
              <p className="text-gray-600 text-xs">
                Available on all dive boats
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SafetyGuidelines;
