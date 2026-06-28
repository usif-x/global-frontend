"use client";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import Select from "@/components/ui/Select";
import tripService from "@/services/tripService";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

//=================================================================
//  1. HELPER COMPONENT: DynamicListField
//=================================================================
/**
 * A styled component for managing dynamic lists of text inputs (e.g., "Included", "Not Included").
 */
const DynamicListField = ({
  title,
  items,
  onChange,
  placeholder,
  icon,
  color = "turquoise",
  disabled,
}) => {
  const handleItemChange = (index, value) => {
    const newItems = items.map((item, i) => (i === index ? value : item));
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const colorClasses = {
    green: "from-green-500 to-emerald-600",
    red: "from-red-500 to-rose-600",
    blue: "from-blue-500 to-sky-600",
  };

  const buttonGradient = colorClasses[color] || colorClasses.blue;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-slate-700">
          {title}
        </label>
        <button
          type="button"
          onClick={addItem}
          className={`bg-gradient-to-r ${buttonGradient} text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2`}
          disabled={disabled}
        >
          <Icon icon="mdi:plus-circle" className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="group flex items-center space-x-3">
            <Input
              dir="ltr"
              icon={icon}
              name={`${title.toLowerCase()}_${index}`}
              type="text"
              placeholder={placeholder}
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              color={color}
              className="flex-1"
              disabled={disabled}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                disabled={disabled}
              >
                <Icon icon="mdi:delete" className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

//=================================================================
//  FeeRow: editor for a single TripFee
//=================================================================
const FeeRow = ({ fee, onChange, onRemove, disabled }) => {
  const handleField = (field, value) => {
    onChange({ ...fee, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          dir="ltr"
          icon="mdi:tag-text"
          placeholder="Fee name (e.g. Marine Park Fee)"
          value={fee.name}
          onChange={(e) => handleField("name", e.target.value)}
          color="orange"
          disabled={disabled}
        />
        <Select
          icon="mdi:swap-horizontal"
          dir="ltr"
          options={[
            { value: "fixed", label: "Fixed amount" },
            { value: "percentage", label: "Percentage of price" },
          ]}
          value={{
            value: fee.fee_type,
            label:
              fee.fee_type === "fixed" ? "Fixed amount" : "Percentage of price",
          }}
          onChange={(opt) => handleField("fee_type", opt.value)}
          placeholder="Fee type"
          disabled={disabled}
        />
        <Input
          dir="ltr"
          icon="mdi:cash"
          type="number"
          step="0.01"
          placeholder={
            fee.fee_type === "percentage"
              ? "Percentage (e.g. 5)"
              : "Amount (EGP)"
          }
          value={fee.value}
          onChange={(e) => handleField("value", e.target.value)}
          color="orange"
          disabled={disabled}
        />
        <Select
          icon="mdi:account-group"
          dir="ltr"
          options={[
            { value: "per_booking", label: "Per booking" },
            { value: "per_person", label: "Per person" },
            { value: "per_adult", label: "Per adult" },
            { value: "per_child", label: "Per child" },
          ]}
          value={{
            value: fee.applies_to,
            label:
              fee.applies_to === "per_booking"
                ? "Per booking"
                : fee.applies_to === "per_adult"
                  ? "Per adult"
                  : fee.applies_to === "per_child"
                    ? "Per child"
                    : "Per person",
          }}
          onChange={(opt) => handleField("applies_to", opt.value)}
          placeholder="Applies to"
          disabled={disabled}
        />
      </div>

      <Input
        dir="ltr"
        icon="mdi:text"
        placeholder="Description (optional, shown to customer)"
        value={fee.description || ""}
        onChange={(e) => handleField("description", e.target.value)}
        color="orange"
        disabled={disabled}
      />

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fee.is_optional}
              onChange={(e) => handleField("is_optional", e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              disabled={disabled}
            />
            <span className="text-sm text-slate-700">Optional add-on</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fee.is_included_in_price}
              onChange={(e) =>
                handleField("is_included_in_price", e.target.checked)
              }
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              disabled={disabled}
            />
            <span className="text-sm text-slate-700">
              Already included in adult/child price (display-only)
            </span>
          </label>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          disabled={disabled}
        >
          <Icon icon="mdi:delete" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

//=================================================================
//  TransferFeeRow: editor for a single TripTransferFee
//=================================================================
const TransferFeeRow = ({
  transferFee,
  zones,
  onChange,
  onRemove,
  disabled,
}) => {
  const handleField = (field, value) => {
    onChange({ ...transferFee, [field]: value });
  };

  const zoneOptions = zones.map((z) => ({
    value: z.id.toString(),
    label: z.region ? `${z.name} (${z.region})` : z.name,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select
          icon="mdi:map-marker"
          dir="ltr"
          options={zoneOptions}
          value={zoneOptions.find(
            (z) => z.value === transferFee.zone_id?.toString(),
          )}
          onChange={(opt) => handleField("zone_id", parseInt(opt.value, 10))}
          placeholder="Pickup zone"
          searchable={true}
          disabled={disabled}
        />
        <Select
          icon="mdi:swap-horizontal"
          dir="ltr"
          options={[
            { value: "fixed", label: "Fixed amount" },
            { value: "percentage", label: "Percentage of price" },
          ]}
          value={{
            value: transferFee.fee_type,
            label:
              transferFee.fee_type === "fixed"
                ? "Fixed amount"
                : "Percentage of price",
          }}
          onChange={(opt) => handleField("fee_type", opt.value)}
          placeholder="Fee type"
          disabled={disabled}
        />
        <Input
          dir="ltr"
          icon="mdi:cash"
          type="number"
          step="0.01"
          placeholder={
            transferFee.fee_type === "percentage"
              ? "Percentage (e.g. 5)"
              : "Price (EGP)"
          }
          value={transferFee.price}
          onChange={(e) => handleField("price", e.target.value)}
          color="cyan"
          disabled={disabled}
        />
        <Select
          icon="mdi:account-group"
          dir="ltr"
          options={[
            { value: "per_booking", label: "Per booking" },
            { value: "per_person", label: "Per person" },
            { value: "per_adult", label: "Per adult" },
            { value: "per_child", label: "Per child" },
          ]}
          value={{
            value: transferFee.applies_to,
            label:
              transferFee.applies_to === "per_booking"
                ? "Per booking"
                : transferFee.applies_to === "per_adult"
                  ? "Per adult"
                  : transferFee.applies_to === "per_child"
                    ? "Per child"
                    : "Per person",
          }}
          onChange={(opt) => handleField("applies_to", opt.value)}
          placeholder="Applies to"
          disabled={disabled}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          disabled={disabled}
        >
          <Icon icon="mdi:delete" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

//=================================================================
//  2. MAIN COMPONENT: TripForm
//=================================================================
const TripForm = ({ trip = null, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [allTrips, setAllTrips] = useState([]);
  const [selectedTripForImport, setSelectedTripForImport] = useState(null);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [transferZones, setTransferZones] = useState([]);

  // Duration unit options
  const durationUnitOptions = [
    { value: "hour/s", label: "Hour(s)" },
    { value: "day/s", label: "Day(s)" },
    { value: "week/s", label: "Week(s)" },
    { value: "month/s", label: "Month(s)" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    package_id: "",
    duration: "",
    duration_unit: "day/s",
    adult_price: "",
    child_price: "",
    child_allowed: true,
    maxim_person: "",
    has_discount: false,
    discount_percentage: "",
    discount_requires_min_people: false,
    discount_always_available: false,
    discount_min_people: "",
    included: [""],
    not_included: [""],
    terms_and_conditions: [""],
    images: [],
    existing_images: [],
    videos: [], // NEW: File objects for new video uploads
    existing_videos: [], // NEW: existing video URLs
    is_image_list: false,
    fees: [], // NEW
    transfer_fees: [], // NEW
  });
  // Load packages and populate form
  useEffect(() => {
    const loadAndPopulate = async () => {
      try {
        const packagesData = await tripService.getPackages();
        setPackages(
          packagesData.map((pkg) => ({
            value: pkg.id.toString(),
            label: pkg.name,
          })),
        );
      } catch (error) {
        toast.error("Failed to load packages for selection.");
      }
    };
    loadAndPopulate();

    if (trip) {
      setFormData({
        name: trip.name || "",
        description: trip.description || "",
        images: [],
        existing_images: trip.images || [],
        videos: [], // NEW
        existing_videos: trip.videos || [], // NEW
        is_image_list: trip.is_image_list || false,
        adult_price: trip.adult_price?.toString() || "",
        child_price: trip.child_price?.toString() || "",
        child_allowed:
          trip.child_allowed !== undefined ? trip.child_allowed : true,
        maxim_person: trip.maxim_person?.toString() || "",
        has_discount: trip.has_discount || false,
        discount_percentage: trip.discount_percentage?.toString() || "",
        discount_requires_min_people:
          trip.discount_requires_min_people || false,
        discount_always_available: trip.discount_always_available || false,
        discount_min_people: trip.discount_min_people?.toString() || "",
        duration: trip.duration?.toString() || "",
        duration_unit: trip.duration_unit || "day/s",
        package_id: trip.package_id?.toString() || "",
        included: trip.included?.length ? trip.included : [""],
        not_included: trip.not_included?.length ? trip.not_included : [""],
        terms_and_conditions: trip.terms_and_conditions?.length
          ? trip.terms_and_conditions
          : [""],
        fees: trip.fees?.length
          ? trip.fees.map((f) => ({ ...f, value: f.value?.toString() }))
          : [],
        transfer_fees: trip.transfer_fees?.length
          ? trip.transfer_fees.map((tf) => ({
              ...tf,
              price: tf.price?.toString(),
            }))
          : [],
      });
    }
  }, [trip]);

  // Load all trips for import functionality
  useEffect(() => {
    const loadTrips = async () => {
      setIsLoadingTrips(true);
      try {
        const tripsData = await tripService.getAll();
        // Filter out current trip if editing
        const filteredTrips = trip
          ? tripsData.filter((t) => t.id !== trip.id)
          : tripsData;
        setAllTrips(filteredTrips);
      } catch (error) {
        console.error("Failed to load trips for import:", error);
      } finally {
        setIsLoadingTrips(false);
      }
    };
    loadTrips();
  }, [trip]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const zonesData = await tripService.getTransferZones();
        setTransferZones(zonesData);
      } catch (error) {
        toast.error("Failed to load transfer zones.");
      }
    };
    loadZones();
  }, []);

  // All handler functions from your original TripForm
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDescriptionChange = (newValue) => {
    setFormData((prev) => ({ ...prev, description: newValue || "" }));
    // Clear error on change
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  const addFee = () =>
    setFormData((prev) => ({
      ...prev,
      fees: [
        ...prev.fees,
        {
          name: "",
          fee_type: "fixed",
          value: "",
          applies_to: "per_person",
          is_optional: false,
          is_included_in_price: false,
          description: "",
        },
      ],
    }));

  const updateFee = (index, updatedFee) =>
    setFormData((prev) => ({
      ...prev,
      fees: prev.fees.map((f, i) => (i === index ? updatedFee : f)),
    }));

  const removeFee = (index) =>
    setFormData((prev) => ({
      ...prev,
      fees: prev.fees.filter((_, i) => i !== index),
    }));

  const addTransferFee = () =>
    setFormData((prev) => ({
      ...prev,
      transfer_fees: [
        ...prev.transfer_fees,
        { zone_id: "", fee_type: "fixed", price: "", applies_to: "per_person" },
      ],
    }));

  const updateTransferFee = (index, updatedFee) =>
    setFormData((prev) => ({
      ...prev,
      transfer_fees: prev.transfer_fees.map((tf, i) =>
        i === index ? updatedFee : tf,
      ),
    }));

  const removeTransferFee = (index) =>
    setFormData((prev) => ({
      ...prev,
      transfer_fees: prev.transfer_fees.filter((_, i) => i !== index),
    }));

  const handleSelectChange = (name, selectedOption) => {
    const valueToSet = selectedOption ? selectedOption.value : "";
    setFormData((prev) => ({ ...prev, [name]: valueToSet }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (index, file) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? file : img)),
    }));
  };

  const addImage = () =>
    setFormData((prev) => ({ ...prev, images: [...prev.images, null] }));

  const removeImage = (index) =>
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

  const removeExistingImage = (index) =>
    setFormData((prev) => ({
      ...prev,
      existing_images: prev.existing_images.filter((_, i) => i !== index),
    }));
  const handleVideoChange = (index, file) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.map((vid, i) => (i === index ? file : vid)),
    }));
  };

  const addVideo = () =>
    setFormData((prev) => ({ ...prev, videos: [...prev.videos, null] }));

  const removeVideo = (index) =>
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));

  const removeExistingVideo = (index) =>
    setFormData((prev) => ({
      ...prev,
      existing_videos: prev.existing_videos.filter((_, i) => i !== index),
    }));

  const handleImportImages = () => {
    if (!selectedTripForImport) {
      toast.error("Please select a trip to import images from");
      return;
    }

    const selectedTrip = allTrips.find(
      (t) => t.id === parseInt(selectedTripForImport),
    );

    if (
      !selectedTrip ||
      !selectedTrip.images ||
      selectedTrip.images.length === 0
    ) {
      toast.error("Selected trip has no images to import");
      return;
    }

    // Add images from selected trip to existing_images
    const newImages = selectedTrip.images.filter(
      (img) => !formData.existing_images.includes(img),
    );

    if (newImages.length === 0) {
      toast.info("All images from this trip are already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      existing_images: [...prev.existing_images, ...newImages],
    }));

    toast.success(
      `Imported ${newImages.length} image(s) from ${selectedTrip.name}`,
    );
    setSelectedTripForImport(null);
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Trip name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.package_id.trim())
      newErrors.package_id = "Package selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.duration || formData.duration <= 0)
      newErrors.duration = "Valid duration is required";
    if (!formData.duration_unit.trim())
      newErrors.duration_unit = "Duration unit is required";
    if (!formData.maxim_person || formData.maxim_person <= 0)
      newErrors.maxim_person = "Max persons is required";
    if (!formData.adult_price || formData.adult_price <= 0)
      newErrors.adult_price = "Adult price is required";

    // Only validate child price if children are allowed
    if (
      formData.child_allowed &&
      (!formData.child_price || formData.child_price <= 0)
    )
      newErrors.child_price =
        "Child price is required when children are allowed";

    if (
      formData.has_discount &&
      (!formData.discount_percentage ||
        formData.discount_percentage <= 0 ||
        formData.discount_percentage > 100)
    ) {
      newErrors.discount_percentage = "Discount must be between 1 and 100";
    }

    // Validate discount min people if required
    if (
      formData.has_discount &&
      formData.discount_requires_min_people &&
      (!formData.discount_min_people || formData.discount_min_people <= 0)
    ) {
      newErrors.discount_min_people = "Minimum people required for discount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};

    formData.fees.forEach((fee, i) => {
      if (!fee.name?.trim()) newErrors[`fee_name_${i}`] = "Fee name required";
      if (!fee.value || parseFloat(fee.value) <= 0)
        newErrors[`fee_value_${i}`] = "Fee value required";
    });

    formData.transfer_fees.forEach((tf, i) => {
      if (!tf.zone_id) newErrors[`transfer_zone_${i}`] = "Zone is required";
      if (!tf.price || parseFloat(tf.price) <= 0)
        newErrors[`transfer_price_${i}`] = "Price required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep4()) {
      toast.error("Please fix the errors on all steps.");
      return;
    }
    setIsLoading(true);
    try {
      // Create FormData for multipart upload
      const submitFormData = new FormData();

      // Add basic fields
      submitFormData.append("name", formData.name);
      submitFormData.append("description", formData.description);
      submitFormData.append("package_id", parseInt(formData.package_id, 10));
      submitFormData.append("duration", parseInt(formData.duration, 10));
      submitFormData.append("duration_unit", formData.duration_unit);
      submitFormData.append("adult_price", parseFloat(formData.adult_price));
      submitFormData.append(
        "child_price",
        formData.child_allowed ? parseFloat(formData.child_price || 0) : 0,
      );
      submitFormData.append("child_allowed", formData.child_allowed);
      submitFormData.append(
        "maxim_person",
        parseInt(formData.maxim_person, 10),
      );
      submitFormData.append("has_discount", formData.has_discount);
      submitFormData.append(
        "discount_percentage",
        formData.has_discount ? parseFloat(formData.discount_percentage) : 0,
      );
      submitFormData.append(
        "discount_requires_min_people",
        formData.has_discount ? formData.discount_requires_min_people : false,
      );
      submitFormData.append(
        "discount_always_available",
        formData.has_discount ? formData.discount_always_available : false,
      );
      submitFormData.append(
        "discount_min_people",
        formData.has_discount && formData.discount_requires_min_people
          ? parseInt(formData.discount_min_people, 10)
          : 0,
      );
      submitFormData.append("is_image_list", formData.is_image_list);

      // Add arrays as JSON strings
      submitFormData.append(
        "included",
        JSON.stringify(formData.included.filter((item) => item && item.trim())),
      );
      submitFormData.append(
        "not_included",
        JSON.stringify(
          formData.not_included.filter((item) => item && item.trim()),
        ),
      );
      submitFormData.append(
        "terms_and_conditions",
        JSON.stringify(
          formData.terms_and_conditions.filter((item) => item && item.trim()),
        ),
      );

      // Fees and transfer fees — send as JSON, with numeric fields properly typed
      submitFormData.append(
        "fees",
        JSON.stringify(
          formData.fees
            .filter((f) => f.name?.trim())
            .map((f) => ({
              ...f,
              value: parseFloat(f.value),
            })),
        ),
      );

      submitFormData.append(
        "transfer_fees",
        JSON.stringify(
          formData.transfer_fees
            .filter((tf) => tf.zone_id)
            .map((tf) => ({
              ...tf,
              zone_id: parseInt(tf.zone_id, 10),
              price: parseFloat(tf.price),
            })),
        ),
      );

      // Add existing images (for updates)
      if (trip && formData.existing_images.length > 0) {
        submitFormData.append(
          "existing_images",
          JSON.stringify(formData.existing_images),
        );
      }

      // Add new image files
      formData.images.forEach((file) => {
        if (file instanceof File) {
          submitFormData.append("images", file);
        }
      });

      // NEW: Add existing videos (for updates)

      if (trip && formData.existing_videos.length > 0) {
        submitFormData.append(
          "existing_videos",
          JSON.stringify(formData.existing_videos),
        );
      }

      // NEW: Add new video files
      formData.videos.forEach((file) => {
        if (file instanceof File) {
          submitFormData.append("videos", file);
        }
      });

      let result;
      if (trip) {
        result = await tripService.update(trip.id, submitFormData);
        toast.success("🎉 Trip updated successfully!");
      } else {
        result = await tripService.create(submitFormData);
        toast.success("🎉 Trip created successfully!");
      }
      onSuccess && onSuccess(result);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to save trip",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Essential Info", icon: "mdi:information-variant-circle" },
    { id: 2, name: "Logistics & Pricing", icon: "mdi:cash-multiple" },
    { id: 3, name: "Details & Media", icon: "mdi:clipboard-text-multiple" },
    { id: 4, name: "Fees & Transfers", icon: "mdi:hail-taxi" },
  ];

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
      {/* Header & Progress Steps */}
      <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon
                icon={trip ? "mdi:airplane-edit" : "mdi:airplane-plus"}
                className="w-8 h-8"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {trip ? "Edit Trip" : "Create New Trip"}
              </h2>
              <p className="text-cyan-100 mt-1">
                {trip
                  ? "Update the details of your adventure"
                  : "Craft an unforgettable journey"}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
            disabled={isLoading}
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <div className="relative mt-8">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/20"></div>
          <div className="relative flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => setCurrentStep(step.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-white text-cyan-600 border-white"
                      : "bg-transparent border-white/50 text-white/80"
                  }`}
                >
                  <Icon icon={step.icon} className="w-5 h-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.id ? "text-white" : "text-white/70"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        {/* Step 1: Essential Info */}
        <div className={`space-y-6 ${currentStep === 1 ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Essential Trip Information
            </h3>
            <div className="space-y-6">
              <Input
                dir="ltr"
                icon="mdi:airplane-takeoff"
                name="name"
                type="text"
                placeholder="Trip Name (e.g., Bali Adventure)"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                color="turquoise"
                required
                disabled={isLoading}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trip Description (Supports Markdown)
                </label>
                <MarkdownEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe this amazing trip using Markdown for lists, bold text, etc."
                  error={errors.description}
                  disabled={isLoading}
                />
              </div>
              <Select
                icon="mdi:package-variant"
                name="package_id"
                dir="ltr"
                options={packages}
                placeholder="Select Package *"
                value={packages.find((p) => p.value === formData.package_id)}
                onChange={(opt) => handleSelectChange("package_id", opt)}
                error={errors.package_id}
                disabled={isLoading}
                searchable={true}
                required={true}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              disabled={
                !formData.name ||
                !formData.description ||
                !formData.package_id ||
                isLoading
              }
            >
              <span>Continue to Logistics</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 2: Logistics & Pricing */}
        <div className={`space-y-6 ${currentStep === 2 ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">
              Logistics & Basic Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration and Duration Unit - Side by Side */}
              <Input
                dir="ltr"
                icon="mdi:clock-outline"
                name="duration"
                type="number"
                placeholder="Duration"
                value={formData.duration}
                onChange={handleInputChange}
                error={errors.duration}
                color="green"
                required
                disabled={isLoading}
              />

              <Select
                icon="mdi:calendar-clock"
                name="duration_unit"
                dir="ltr"
                options={durationUnitOptions}
                placeholder="Select Duration Unit *"
                value={durationUnitOptions.find(
                  (unit) => unit.value === formData.duration_unit,
                )}
                onChange={(opt) => handleSelectChange("duration_unit", opt)}
                error={errors.duration_unit}
                disabled={isLoading}
                searchable={false}
                required={true}
              />

              <Input
                dir="ltr"
                icon="mdi:account-group"
                name="maxim_person"
                type="number"
                placeholder="Max Persons"
                value={formData.maxim_person}
                onChange={handleInputChange}
                error={errors.maxim_person}
                color="green"
                required
                disabled={isLoading}
              />

              {/* Child Allowed Section */}
              <div className="md:col-span-2 space-y-3 bg-white/50 p-4 rounded-xl">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="child_allowed"
                    checked={formData.child_allowed}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Icon icon="mdi:baby-face" className="w-4 h-4" />
                    <span>Allow Children on this Trip</span>
                  </span>
                </label>
                {!formData.child_allowed && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start space-x-2">
                      <Icon
                        icon="mdi:alert"
                        className="w-4 h-4 text-orange-600 mt-0.5"
                      />
                      <p className="text-sm text-orange-700">
                        This trip is restricted to adults only. Children will
                        not be allowed to participate.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Discount Section */}
              <div className="md:col-span-2 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon
                    icon="mdi:tag-percent"
                    className="w-5 h-5 text-purple-600"
                  />
                  <h4 className="text-lg font-semibold text-slate-800">
                    Discount Settings
                  </h4>
                </div>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_discount"
                    checked={formData.has_discount}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Offer a Discount for this Trip
                  </span>
                </label>

                {formData.has_discount && (
                  <div className="space-y-4 bg-white p-4 rounded-lg border border-purple-200">
                    <Input
                      dir="ltr"
                      icon="mdi:percent"
                      name="discount_percentage"
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      placeholder="Discount Percentage (1-100)"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      error={errors.discount_percentage}
                      color="purple"
                      disabled={isLoading}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-start space-x-3 cursor-pointer p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <input
                          type="checkbox"
                          name="discount_always_available"
                          checked={formData.discount_always_available}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                          disabled={isLoading}
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700 block">
                            Always Available
                          </span>
                          <p className="text-xs text-slate-600 mt-1">
                            Apply discount automatically for all bookings
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <input
                          type="checkbox"
                          name="discount_requires_min_people"
                          checked={formData.discount_requires_min_people}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                          disabled={
                            isLoading || formData.discount_always_available
                          }
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700 block">
                            Requires Minimum People
                          </span>
                          <p className="text-xs text-slate-600 mt-1">
                            Only apply if minimum people book
                          </p>
                        </div>
                      </label>
                    </div>

                    {formData.discount_requires_min_people &&
                      !formData.discount_always_available && (
                        <Input
                          dir="ltr"
                          icon="mdi:account-multiple"
                          name="discount_min_people"
                          type="number"
                          min="2"
                          placeholder="Minimum People Required for Discount"
                          value={formData.discount_min_people}
                          onChange={handleInputChange}
                          error={errors.discount_min_people}
                          color="purple"
                          disabled={isLoading}
                        />
                      )}

                    {formData.discount_always_available && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <Icon
                            icon="mdi:check-circle"
                            className="w-4 h-4 text-green-600 mt-0.5"
                          />
                          <p className="text-sm text-green-700">
                            This discount will be automatically applied to all
                            bookings for this trip.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-2xl p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center space-x-2">
              <Icon
                icon="mdi:cash-multiple"
                className="w-6 h-6 text-orange-600"
              />
              <span>Pricing (EGP)</span>
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Icon
                  icon="mdi:information"
                  className="w-5 h-5 text-blue-600 mt-0.5"
                />
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Payment Processing
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Prices are set in EGP. Our payment provider will
                    automatically convert to the customer's preferred currency
                    during checkout.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                dir="ltr"
                icon="mdi:account"
                name="adult_price"
                type="number"
                step="0.01"
                placeholder="Adult Price (EGP)"
                value={formData.adult_price}
                onChange={handleInputChange}
                error={errors.adult_price}
                color="orange"
                required
                disabled={isLoading}
              />
              {formData.child_allowed && (
                <Input
                  dir="ltr"
                  icon="mdi:account-child"
                  name="child_price"
                  type="number"
                  step="0.01"
                  placeholder="Child Price (EGP)"
                  value={formData.child_price}
                  onChange={handleInputChange}
                  error={errors.child_price}
                  color="green"
                  required={formData.child_allowed}
                  disabled={isLoading}
                />
              )}
              {!formData.child_allowed && (
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <Icon
                      icon="mdi:baby-face-off"
                      className="w-8 h-8 text-gray-400 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-600">
                      Child pricing not applicable
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Children are not allowed on this trip
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              disabled={isLoading}
            >
              <span>Continue to Details</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 3: Details & Media */}
        <div className={`space-y-6 ${currentStep === 3 ? "block" : "hidden"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100 space-y-6">
              <DynamicListField
                title="What's Included"
                items={formData.included}
                onChange={(items) =>
                  setFormData((prev) => ({ ...prev, included: items }))
                }
                placeholder="e.g., Airport Transfer"
                icon="mdi:check"
                color="green"
                disabled={isLoading}
              />
              <DynamicListField
                title="What's Not Included"
                items={formData.not_included}
                onChange={(items) =>
                  setFormData((prev) => ({ ...prev, not_included: items }))
                }
                placeholder="e.g., International Flights"
                icon="mdi:close"
                color="red"
                disabled={isLoading}
              />
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 space-y-6">
              <DynamicListField
                title="Terms & Conditions"
                items={formData.terms_and_conditions}
                onChange={(items) =>
                  setFormData((prev) => ({
                    ...prev,
                    terms_and_conditions: items,
                  }))
                }
                placeholder="e.g., Cancellation Policy"
                icon="mdi:file-document-outline"
                color="blue"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-700">
                Trip Images
              </label>
              <button
                type="button"
                onClick={addImage}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                disabled={isLoading}
              >
                <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                <span>Add Image</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700">
                  Trip Videos
                </label>
                <button
                  type="button"
                  onClick={addVideo}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  disabled={isLoading}
                >
                  <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                  <span>Add Video</span>
                </button>
              </div>

              {/* Existing Videos */}
              {formData.existing_videos.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">
                    Current Videos
                  </h4>
                  <div className="space-y-3">
                    {formData.existing_videos.map((videoUrl, index) => (
                      <div
                        key={`existing-video-${index}`}
                        className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 flex items-start space-x-4"
                      >
                        <div className="flex-shrink-0">
                          <video
                            src={videoUrl}
                            className="w-28 h-20 object-cover rounded-lg border-2 border-slate-200 bg-black"
                            muted
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">
                            Existing Video {index + 1}
                          </p>
                          <p className="text-xs text-slate-500 break-all">
                            {videoUrl}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingVideo(index)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          disabled={isLoading}
                        >
                          <Icon icon="mdi:delete" className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Video Uploads */}
              <div className="space-y-4">
                {formData.videos.map((video, index) => (
                  <div
                    key={`new-video-${index}`}
                    className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 flex items-start space-x-4"
                  >
                    <div className="flex-shrink-0">
                      {video instanceof File ? (
                        <video
                          src={URL.createObjectURL(video)}
                          className="w-28 h-20 object-cover rounded-lg border-2 border-slate-200 bg-black"
                          muted
                          controls
                        />
                      ) : (
                        <div className="w-28 h-20 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                          <Icon
                            icon="mdi:video-plus"
                            className="w-8 h-8 text-slate-400"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Validate file size (100MB limit — adjust to your S3/dyno limits)
                            if (file.size > 100 * 1024 * 1024) {
                              toast.error("Video size must be less than 100MB");
                              return;
                            }
                            handleVideoChange(index, file);
                          }
                        }}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 file:cursor-pointer cursor-pointer"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        New Video {index + 1} • Max 100MB • MP4, WebM, MOV
                      </p>
                      {video instanceof File && (
                        <p className="text-xs text-green-600 mt-1">
                          Selected: {video.name} (
                          {(video.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      disabled={isLoading}
                    >
                      <Icon icon="mdi:delete" className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {formData.videos.length === 0 &&
                  formData.existing_videos.length === 0 && (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                      <Icon
                        icon="mdi:video-plus"
                        className="w-12 h-12 text-slate-400 mx-auto mb-4"
                      />
                      <h4 className="text-lg font-medium text-slate-600 mb-2">
                        No videos yet
                      </h4>
                      <p className="text-sm text-slate-500 mb-4">
                        Upload a short highlight video to give travelers a feel
                        for the trip
                      </p>
                      <button
                        type="button"
                        onClick={addVideo}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        disabled={isLoading}
                      >
                        Upload First Video
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {/* Import Images from Another Trip */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 mb-6">
              <div className="flex items-start space-x-3 mb-4">
                <Icon
                  icon="mdi:import"
                  className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">
                    Import Images from Another Trip
                  </h4>
                  <p className="text-xs text-slate-600">
                    Select an existing trip to import its images
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {isLoadingTrips ? (
                  <div className="flex items-center justify-center py-4">
                    <Icon
                      icon="mdi:loading"
                      className="w-6 h-6 text-blue-500 animate-spin"
                    />
                    <span className="ml-2 text-sm text-slate-600">
                      Loading trips...
                    </span>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedTripForImport || ""}
                      onChange={(e) => setSelectedTripForImport(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={isLoading || allTrips.length === 0}
                    >
                      <option value="">
                        {allTrips.length === 0
                          ? "No trips available"
                          : "Select a trip to import from..."}
                      </option>
                      {allTrips.map((tripItem) => (
                        <option key={tripItem.id} value={tripItem.id}>
                          {tripItem.name} ({tripItem.images?.length || 0} image
                          {tripItem.images?.length !== 1 ? "s" : ""})
                        </option>
                      ))}
                    </select>

                    {selectedTripForImport && (
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        {(() => {
                          const selectedTrip = allTrips.find(
                            (t) => t.id === parseInt(selectedTripForImport),
                          );
                          return selectedTrip ? (
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-slate-800">
                                    {selectedTrip.name}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    {selectedTrip.images?.length || 0} image(s)
                                    available
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleImportImages}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                                  disabled={
                                    isLoading ||
                                    !selectedTrip.images ||
                                    selectedTrip.images.length === 0
                                  }
                                >
                                  <Icon icon="mdi:import" className="w-4 h-4" />
                                  <span>Import Images</span>
                                </button>
                              </div>

                              {selectedTrip.images &&
                                selectedTrip.images.length > 0 && (
                                  <div className="grid grid-cols-4 gap-2 mt-3">
                                    {selectedTrip.images
                                      .slice(0, 4)
                                      .map((img, idx) => (
                                        <div
                                          key={idx}
                                          className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200"
                                        >
                                          <img
                                            src={img}
                                            alt={`Preview ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.src =
                                                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"><path fill="%23ccc" d="M21,17H7V3A1,1 0 0,1 8,2H20A1,1 0 0,1 21,3V17M19,4H9V15H19V4M16,10.5L13.5,13.5L11.5,11L9,14H19M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6Z"/></svg>';
                                            }}
                                          />
                                        </div>
                                      ))}
                                    {selectedTrip.images.length > 4 && (
                                      <div className="aspect-square rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                                        <span className="text-xs font-medium text-slate-600">
                                          +{selectedTrip.images.length - 4}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Display Options */}
            <div className="bg-white rounded-xl p-4 border border-purple-200 mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_image_list"
                  checked={formData.is_image_list}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  disabled={isLoading}
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Display as List
                  </span>
                  <p className="text-xs text-slate-500">
                    Show images in a vertical list instead of a grid
                  </p>
                </div>
              </label>
            </div>

            {/* Existing Images */}
            {formData.existing_images.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Current Images
                </h4>
                <div className="space-y-3">
                  {formData.existing_images.map((imageUrl, index) => (
                    <div
                      key={`existing-${index}`}
                      className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
                          onError={(e) => {
                            e.target.src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"><path fill="%23ccc" d="M21,17H7V3A1,1 0 0,1 8,2H20A1,1 0 0,1 21,3V17M19,4H9V15H19V4M16,10.5L13.5,13.5L11.5,11L9,14H19M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6Z"/></svg>';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">
                          Existing Image {index + 1}
                        </p>
                        <p className="text-xs text-slate-500 break-all">
                          {imageUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        disabled={isLoading}
                      >
                        <Icon icon="mdi:delete" className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Uploads */}
            <div className="space-y-4">
              {formData.images.map((image, index) => (
                <div
                  key={`new-${index}`}
                  className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">
                    {image instanceof File ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                        <Icon
                          icon="mdi:image-plus"
                          className="w-8 h-8 text-slate-400"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Validate file size (5MB limit)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("Image size must be less than 5MB");
                            return;
                          }
                          handleImageChange(index, file);
                        }
                      }}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      New Image {index + 1} • Max 5MB • JPEG, PNG, WebP
                    </p>
                    {image instanceof File && (
                      <p className="text-xs text-green-600 mt-1">
                        Selected: {image.name} (
                        {(image.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    <Icon icon="mdi:delete" className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 &&
                formData.existing_images.length === 0 && (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                    <Icon
                      icon="mdi:image-plus"
                      className="w-12 h-12 text-slate-400 mx-auto mb-4"
                    />
                    <h4 className="text-lg font-medium text-slate-600 mb-2">
                      No images yet
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">
                      Upload high-quality images to showcase your trip
                    </p>
                    <button
                      type="button"
                      onClick={addImage}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      disabled={isLoading}
                    >
                      Upload First Image
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Step 3 footer — replace final submit button with a "Continue" button */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={isLoading}
              className="..."
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              disabled={isLoading}
            >
              <span>Continue to Fees</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 4: Fees & Transfers */}
        <div className={`space-y-6 ${currentStep === 4 ? "block" : "hidden"}`}>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <Icon
                    icon="mdi:cash-plus"
                    className="w-6 h-6 text-orange-600"
                  />
                  <span>Additional Fees</span>
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Marine Park fee, equipment rental, port fees, etc. — added on
                  top of the base price.
                </p>
              </div>
              <button
                type="button"
                onClick={addFee}
                className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                disabled={isLoading}
              >
                <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                <span>Add Fee</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.fees.map((fee, index) => (
                <FeeRow
                  key={index}
                  fee={fee}
                  onChange={(updated) => updateFee(index, updated)}
                  onRemove={() => removeFee(index)}
                  disabled={isLoading}
                />
              ))}
              {formData.fees.length === 0 && (
                <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center">
                  <p className="text-sm text-slate-500">
                    No extra fees for this trip yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <Icon icon="mdi:bus" className="w-6 h-6 text-cyan-600" />
                  <span>Transfer Pricing by Zone</span>
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Set pickup cost based on the customer's hotel zone (e.g. El
                  Gouna, Sahl Hasheesh).
                </p>
              </div>
              <button
                type="button"
                onClick={addTransferFee}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                disabled={isLoading || transferZones.length === 0}
              >
                <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                <span>Add Zone Price</span>
              </button>
            </div>

            {transferZones.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
                <Icon
                  icon="mdi:alert"
                  className="w-4 h-4 text-yellow-600 mt-0.5"
                />
                <p className="text-sm text-yellow-700">
                  No transfer zones exist yet. Create zones (e.g. El Gouna, Sahl
                  Hasheesh) in zone settings first.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {formData.transfer_fees.map((tf, index) => (
                <TransferFeeRow
                  key={index}
                  transferFee={tf}
                  zones={transferZones}
                  onChange={(updated) => updateTransferFee(index, updated)}
                  onRemove={() => removeTransferFee(index)}
                  disabled={isLoading}
                />
              ))}
              {formData.transfer_fees.length === 0 && (
                <div className="border-2 border-dashed border-cyan-300 rounded-xl p-6 text-center">
                  <p className="text-sm text-slate-500">
                    No transfer pricing set for this trip yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Final submit */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex space-x-4">
              <Button
                type="button"
                color="gray"
                text="Cancel"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-3"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check-circle" className="w-5 h-5" />
                    <span>{trip ? "Update Trip" : "Create Trip"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripForm;
