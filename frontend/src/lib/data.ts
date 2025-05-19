// src/lib/data.ts

export interface CarType {
  _id: string;
  title: string;
  make: string;
  model: string;
  year: number; // Changed from string | number to number
  price: number;
  mileage: number;
  condition: string;
  location: string;
  description: string;
  images: Array<{
    url: string;
    publicId: string;
  }>;
  seller: {
    _id: string;
    name: string;
  };
  status: string;
  createdAt: string;
  features?: string[];
  exteriorColor?: string;
  interiorColor?: string;
  fuelType?: string;
  transmission?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  rating: number;
  featured?: boolean;
  available?: boolean;
  reviewCount?: number;
  provider?: {
    id: string;
    name: string;
    image?: string;
    verified?: boolean;
    location?: string;
    rating: number;
    reviewCount?: number;
  };
  category?: string;
  duration?: string;
}

export interface ReviewType {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FAQType {
  id: string;
  question: string;
  answer: string;
}

export interface TestimonialType {
  id: string;
  name: string;
  title: string;
  image: string;
  quote: string;
  rating?: number;
}

export interface TeamMemberType {
  id: string;
  name: string;
  title: string;
  image: string;
  bio: string;
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
}

// Define features array that's being imported in Features.tsx
export const features = [
  {
    title: "Verified Listings",
    description: "Every vehicle on our platform undergoes a thorough verification process for your peace of mind.",
    icon: "search"
  },
  {
    title: "Transparent History",
    description: "Access complete vehicle history reports with maintenance records and past ownership details.",
    icon: "info"
  },
  {
    title: "Quality Service",
    description: "Connect with trusted service providers offering transparent pricing and verified reviews.",
    icon: "settings"
  },
  {
    title: "Smart Dashboard",
    description: "Track your vehicles, services, and transactions in one convenient location.",
    icon: "dashboard"
  }
];

// export const cars: CarType[] = [
//   {
//     id: '1',
//     make: 'Toyota',
//     model: 'Camry',
//     year: 2020,
//     color: 'Silver',
//     mileage: 35000,
//     price: 18500,
//     engine: '2.5L I4',
//     transmission: 'Automatic',
//     bodyType: 'Sedan',
//     fuelType: 'Gasoline',
//     location: 'New York, NY',
//     images: [
//       'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1583121274602-3e2820c69889?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1605559424843-9e4c228d88c0?auto=format&fit=crop&w=300&q=80'
//     ],
//     description: 'Reliable and fuel-efficient sedan. Perfect for daily commute.',
//     features: ['Backup Camera', 'Bluetooth', 'Adaptive Cruise Control'],
//     isFeatured: true,
//     isAvailable: true,
//     owner: {
//       name: 'John Doe',
//       location: 'New York, NY',
//       rating: 4.5,
//       reviewCount: 50,
//       image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=60&h=60&facepad=2',
//       verified: true
//     }
//   },
//   {
//     id: '2',
//     make: 'Honda',
//     model: 'Civic',
//     year: 2021,
//     color: 'Blue',
//     mileage: 28000,
//     price: 19200,
//     engine: '1.5L I4 Turbo',
//     transmission: 'CVT',
//     bodyType: 'Hatchback',
//     fuelType: 'Gasoline',
//     location: 'Los Angeles, CA',
//     images: [
//       'https://images.unsplash.com/photo-1541443103-5245472bf599?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1580273969890-c568db3e52e2?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1568605114967-8dd0b510ff61?auto=format&fit=crop&w=300&q=80'
//     ],
//     description: 'Sporty hatchback with great fuel economy and modern features.',
//     features: ['Sunroof', 'Apple CarPlay', 'Lane Departure Warning'],
//     isFeatured: false,
//     isAvailable: true,
//     owner: {
//       name: 'Jane Smith',
//       location: 'Los Angeles, CA',
//       rating: 4.8,
//       reviewCount: 75,
//       image: 'https://images.unsplash.com/photo-1494790108377-be9c29b88360?auto=format&fit=facearea&w=60&h=60&facepad=2',
//       verified: true
//     }
//   },
//   {
//     id: '3',
//     make: 'Tesla',
//     model: 'Model 3',
//     year: 2022,
//     color: 'White',
//     mileage: 15000,
//     price: 45000,
//     engine: 'Electric',
//     transmission: 'Automatic',
//     bodyType: 'Sedan',
//     fuelType: 'Electric',
//     location: 'San Francisco, CA',
//     images: [
//       'https://images.unsplash.com/photo-1617583478489-f19989c7ca19?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1617583515937-4980708f4dd1?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1662585496848-69bca13f4e00?auto=format&fit=crop&w=300&q=80'
//     ],
//     description: 'High-performance electric sedan with advanced technology.',
//     features: ['Autopilot', 'Premium Interior', 'Supercharger Access'],
//     isFeatured: true,
//     isAvailable: true,
//     owner: {
//       name: 'Elon Musk',
//       location: 'San Francisco, CA',
//       rating: 4.9,
//       reviewCount: 100,
//       image: 'https://images.unsplash.com/photo-1519085360753-af0119f825cd?auto=format&fit=facearea&w=60&h=60&facepad=2',
//       verified: true
//     }
//   },
//   {
//     id: '4',
//     make: 'Ford',
//     model: 'F-150',
//     year: 2020,
//     color: 'Gray',
//     mileage: 42000,
//     price: 28000,
//     engine: '3.5L V6',
//     transmission: 'Automatic',
//     bodyType: 'Truck',
//     fuelType: 'Gasoline',
//     location: 'Houston, TX',
//     images: [
//       'https://images.unsplash.com/photo-1630239669894-c6923d18789b?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1567908457784-7f6c5e599746?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1589186850539-8793914363a4?auto=format&fit=crop&w=300&q=80'
//     ],
//     description: 'Tough and reliable pickup truck. Perfect for work and play.',
//     features: ['4x4', 'Towing Package', 'Bed Liner'],
//     isFeatured: false,
//     isAvailable: true,
//     owner: {
//       name: 'Bob Johnson',
//       location: 'Houston, TX',
//       rating: 4.6,
//       reviewCount: 60,
//       image: 'https://images.unsplash.com/photo-1534528741702-a0cfae562c9c?auto=format&fit=facearea&w=60&h=60&facepad=2',
//       verified: true
//     }
//   },
//   {
//     id: '5',
//     make: 'BMW',
//     model: 'X5',
//     year: 2019,
//     color: 'Black',
//     mileage: 51000,
//     price: 38000,
//     engine: '3.0L I6 Turbo',
//     transmission: 'Automatic',
//     bodyType: 'SUV',
//     fuelType: 'Gasoline',
//     location: 'Miami, FL',
//     images: [
//       'https://images.unsplash.com/photo-1580516943758-8652c348dc2a?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1599491714909-3f655219a6a8?auto=format&fit=crop&w=300&q=80',
//       'https://images.unsplash.com/photo-1607882904848-2c94e6533983?auto=format&fit=crop&w=300&q=80'
//     ],
//     description: 'Luxurious and spacious SUV with powerful engine.',
//     features: ['Leather Seats', 'Navigation System', 'Panoramic Sunroof'],
//     isFeatured: true,
//     isAvailable: true,
//     owner: {
//       name: 'Alice Williams',
//       location: 'Miami, FL',
//       rating: 4.7,
//       reviewCount: 80,
//       image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936e7e?auto=format&fit=facearea&w=60&h=60&facepad=2',
//       verified: true
//     }
//   }
// ];

export const services: ServiceType[] = [
  {
    id: '1',
    name: 'Basic Car Service',
    description: 'Complete checkup with oil change and filter replacement',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=300&h=200',
    rating: 4.5,
    featured: true,
    available: true,
    reviewCount: 126,
    provider: {
      id: '1',
      name: 'Quick Service Center',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=60&h=60&facepad=2',
      verified: true,
      location: 'Mumbai, Maharashtra',
      rating: 4.5,
      reviewCount: 126
    },
    category: 'Maintenance'
  },
  {
    id: '2',
    name: 'Premium Car Wash',
    description: 'Exterior wash, interior vacuum, and polish treatment',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=300&h=200',
    rating: 4.2,
    featured: false,
    available: true,
    reviewCount: 85,
    provider: {
      id: '2',
      name: 'Sparkle Auto Spa',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=60&h=60&facepad=2',
      verified: true,
      location: 'Delhi, NCR',
      rating: 4.2,
      reviewCount: 85
    },
    category: 'Cleaning'
  },
  {
    id: '3',
    name: 'Engine Diagnostics',
    description: 'Computer diagnostics to identify engine issues',
    price: 3999,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=300&h=200',
    rating: 4.7,
    featured: true,
    available: true,
    reviewCount: 203,
    provider: {
      id: '3',
      name: 'Tech Auto Solutions',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=60&h=60&facepad=2',
      verified: true,
      location: 'Bangalore, Karnataka',
      rating: 4.7,
      reviewCount: 203
    },
    category: 'Diagnostics'
  },
  {
    id: '4',
    name: 'Tire Replacement',
    description: 'Replacement of all four tires with alignment',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1550855297-c0b50ea42690?auto=format&fit=crop&w=300&h=200',
    rating: 4.4,
    featured: false,
    available: true,
    reviewCount: 156,
    provider: {
      id: '4',
      name: 'Wheel Works',
      image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=facearea&w=60&h=60&facepad=2',
      verified: false,
      location: 'Chennai, Tamil Nadu',
      rating: 4.4,
      reviewCount: 156
    },
    category: 'Replacement'
  }
];

export const reviews: ReviewType[] = [
  {
    id: '1',
    author: 'Samantha',
    rating: 5,
    comment: 'Excellent service! The staff was friendly and efficient.',
    date: '2023-08-01'
  },
  {
    id: '2',
    author: 'David',
    rating: 4,
    comment: 'Good experience overall. The waiting area could be cleaner.',
    date: '2023-07-15'
  },
  {
    id: '3',
    author: 'Emily',
    rating: 5,
    comment: 'I highly recommend this service center. They are honest and reliable.',
    date: '2023-07-01'
  }
];

export const faqs: FAQType[] = [
  {
    id: '1',
    question: 'What are your hours of operation?',
    answer: 'We are open Monday through Friday from 8am to 6pm.'
  },
  {
    id: '2',
    question: 'Do you offer a warranty on your services?',
    answer: 'Yes, we offer a 12-month warranty on all of our services.'
  },
  {
    id: '3',
    question: 'Do I need to make an appointment?',
    answer: 'Yes, we recommend making an appointment to ensure that we can serve you in a timely manner.'
  }
];

export const testimonials: TestimonialType[] = [
  {
    id: '1',
    name: 'John Smith',
    title: 'Car Owner',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=300&h=300',
    quote: 'I was very impressed with the quality of service I received. The staff was knowledgeable and helpful, and they went above and beyond to make sure I was satisfied.'
  },
  {
    id: '2',
    name: 'Jane Doe',
    title: 'Car Enthusiast',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b88360?auto=format&fit=facearea&w=300&h=300',
    quote: 'I have been a customer of this service center for many years, and I have always been happy with their work. They are always willing to go the extra mile to make sure I am satisfied.'
  }
];

export const teamMembers: TeamMemberType[] = [
  {
    id: '1',
    name: 'Mike Johnson',
    title: 'Service Manager',
    image: 'https://images.unsplash.com/photo-1534528741702-a0cfae562c9c?auto=format&fit=facearea&w=300&h=300',
    bio: 'Mike has been in the automotive industry for over 20 years. He is a certified mechanic and a customer service expert.',
    social: {
      facebook: '#',
      twitter: '#',
      linkedin: '#'
    }
  },
  {
    id: '2',
    name: 'Sarah Williams',
    title: 'Technician',
    image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936e7e?auto=format&fit=facearea&w=300&h=300',
    bio: 'Sarah is a skilled technician with a passion for cars. She is always up-to-date on the latest automotive technology.',
    social: {
      facebook: '#',
      twitter: '#',
      linkedin: '#'
    }
  }
];
