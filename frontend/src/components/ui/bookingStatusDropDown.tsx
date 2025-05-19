import React, { useState } from 'react';

interface BookingStatusDropdownProps {
  currentStatus: string;
  onChangeStatus: (newStatus: string) => void;
}

const BookingStatusDropdown: React.FC<BookingStatusDropdownProps> = ({ currentStatus, onChangeStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    onChangeStatus(newStatus); // Callback to update status in parent or backend
  };

  return (
    <select value={selectedStatus} onChange={handleChange}>
      <option value="Pending">Pending</option>
      <option value="Confirmed">Confirmed</option>
      <option value="Completed">Completed</option>
      <option value="Cancelled">Cancelled</option>
    </select>
  );
};

export default BookingStatusDropdown;
