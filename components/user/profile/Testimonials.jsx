import { getData, postData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// A simple, reusable StarRating component for this tab
const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, index) => (
      <Icon
        key={index}
        icon={index < rating ? "mdi:star" : "mdi:star-outline"}
        className={`h-5 w-5 ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ))}
  </div>
);

// A component to display the status badge
const StatusBadge = ({ is_accepted, is_rejected }) => {
  let status, className;

  if (is_accepted) {
    status = "Accepted";
    className = "bg-green-100 text-green-800";
  } else if (is_rejected) {
    status = "Rejected";
    className = "bg-red-100 text-red-800";
  } else {
    status = "Pending Review";
    className = "bg-yellow-100 text-yellow-800";
  }

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${className}`}
    >
      {status}
    </span>
  );
};

// The card for displaying a single testimonial
const TestimonialItem = ({ testimonial }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-start mb-4">
      <StarRating rating={testimonial.rating} />
      <StatusBadge
        is_accepted={testimonial.is_accepted}
        is_rejected={testimonial.is_rejected}
      />
    </div>
    <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-700">
      <p>"{testimonial.description}"</p>
    </blockquote>
    <div className="mt-4 text-right text-xs text-gray-400">
      Submitted on {format(new Date(testimonial.created_at), "MMMM d, yyyy")}
    </div>
  </div>
);

// Simple modal for creating a new testimonial
const CreateTestimonialModal = ({ isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await postData(
        "/testimonials/create",
        {
          description: description.trim(),
          rating: rating,
          notes: notes.trim() || null,
        },
        true
      );

      toast.success("Thank you! Your testimonial has been submitted.");
      setRating(0);
      setDescription("");
      setNotes("");
      onClose();
      onSuccess();
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Icon
                    icon={star <= rating ? "mdi:star" : "mdi:star-outline"}
                    className={`w-8 h-8 ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Share your experience..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Any additional comments or context..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || !description.trim()}
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TestimonialsTab = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await getData("/users/me/testimonials", true);
      setTestimonials(response || []);
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
      setError("Could not load your testimonials. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const renderContent = () => {
    if (loading) {
      // Skeleton loader
      return (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 px-4 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      );
    }

    if (testimonials.length === 0) {
      return (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <Icon
            icon="mdi:star-plus-outline"
            className="mx-auto h-12 w-12 text-gray-400"
          />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No testimonials submitted
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Share your experience to help others and us improve!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700"
          >
            <Icon icon="mdi:star-plus" className="w-5 h-5 mr-2" />
            Submit a Testimonial
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {testimonials.map((testimonial) => (
          <TestimonialItem key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold leading-tight text-gray-900">
          My Submitted Testimonials
        </h2>
        {!loading && testimonials.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
          >
            <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
            Add New
          </button>
        )}
      </div>
      {renderContent()}

      <CreateTestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchTestimonials();
        }}
      />
    </div>
  );
};

export default TestimonialsTab;
