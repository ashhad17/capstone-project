import React from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any; // Pass the booking data to display
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking }) => {
  const { isDark } = useTheme(); // Access dark mode state

  if (!booking) return null; // If no booking is passed, return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
     >
      <div className="space-y-4">
        {/* Booking Information */}
        <div>
          <h3 className="text-lg font-semibold">Booking ID</h3>
          <p>{booking._id || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Service Provider</h3>
          <p>{booking.serviceProvider?.name || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Customer</h3>
          <p>{booking.user?.name || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Date & Time</h3>
          <p>
            {new Date(booking.date).toLocaleDateString()} at {booking.time || "N/A"}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Status</h3>
          <p
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              booking.status === "confirmed"
                ? "bg-green-100 text-green-800"
                : booking.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : booking.status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {booking.status || "N/A"}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Total Price</h3>
          <p>${booking.totalPrice || "N/A"}</p>
        </div>

        {/* Services List */}
        <div>
          <h3 className="text-lg font-semibold">Services</h3>
          <ul className="list-disc pl-5">
            {booking.services?.length > 0 ? (
              booking.services.map((service: any) => (
                <li key={service._id}>
                  <p>
                    <strong>{service.name}</strong> - ${service.price} ({service.duration} mins)
                  </p>
                </li>
              ))
            ) : (
              <p>No services available</p>
            )}
          </ul>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          className={`${
            isDark
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default BookingDetailsModal;