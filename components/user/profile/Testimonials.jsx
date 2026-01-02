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
  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <StarRating rating={testimonial.rating} />
      <StatusBadge
        is_accepted={testimonial.is_accepted}
        is_rejected={testimonial.is_rejected}
      />
    </div>
    <blockquote className="border-l-4 border-gradient-to-b from-cyan-500 to-blue-600 pl-4 italic text-slate-700 bg-slate-50 p-4 rounded-r-lg">
      <p className="text-sm">"{testimonial.description}"</p>
    </blockquote>
    <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500">
      <Icon icon="mdi:calendar" className="w-4 h-4" />
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
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
              <Icon icon="mdi:star" className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Write a Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              placeholder="Share your experience..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              placeholder="Any additional comments or context..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || !description.trim()}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
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
      return (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 px-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <Icon
            icon="mdi:alert-circle"
            className="mx-auto h-12 w-12 text-red-500 mb-3"
          />
          <p className="font-medium">{error}</p>
        </div>
      );
    }

    if (testimonials.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl border border-slate-200">
          <Icon
            icon="mdi:star-plus-outline"
            className="mx-auto h-16 w-16 text-slate-400 mb-4"
          />
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            No testimonials submitted
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Share your experience to help others and us improve!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
          >
            <Icon icon="mdi:star-plus" className="w-5 h-5" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
              <Icon icon="mdi:comment-quote" className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                My Testimonials
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Share your experience with our services
              </p>
            </div>
          </div>
          {!loading && testimonials.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              Add New
            </button>
          )}
        </div>
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
