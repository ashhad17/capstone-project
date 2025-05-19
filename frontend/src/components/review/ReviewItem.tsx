
import React from 'react';
import { Star, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

interface ReviewItemProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    userName: string;
    userImage?: string;
    createdAt: string;
  };
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const { isDark } = useTheme();
  
  const formattedDate = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} last:border-0`}
    >
      <div className="flex items-center mb-3">
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mr-3`}>
          {review.userImage ? (
            <img src={review.userImage} alt={review.userName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </div>
        <div>
          <h4 className={`font-medium ${isDark ? 'text-white' : ''}`}>{review.userName}</h4>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formattedDate}</div>
        </div>
      </div>
      
      <div className="flex mb-2">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={
              index < review.rating
                ? 'text-yellow-400 fill-yellow-400'
                : isDark ? 'text-gray-600' : 'text-gray-300'
            }
          />
        ))}
      </div>
      
      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{review.comment}</p>
    </motion.div>
  );
};

export default ReviewItem;
