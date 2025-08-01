import { getData } from "@/lib/axios";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

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

const TestimonialsTab = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          {/* This button could open the "Rate Us" modal you built earlier */}
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700">
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
      <h2 className="text-2xl font-bold leading-tight text-gray-900 mb-6">
        My Submitted Testimonials
      </h2>
      {renderContent()}
    </div>
  );
};

export default TestimonialsTab;
