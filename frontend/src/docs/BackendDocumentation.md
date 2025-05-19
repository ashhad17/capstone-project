
# WheelsTrust API Documentation

## Overview

The WheelsTrust API is a RESTful API that provides endpoints for managing cars, users, service providers, and other features of the WheelsTrust platform. This document provides details about the API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.wheelstrust.com/v1
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Endpoints

#### POST /auth/register

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user" // "user", "service_provider", or "admin"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-05-01T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login

Authenticate a user and get a JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout

Invalidate the current JWT token.

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## User Endpoints

### GET /users

Get a list of users (admin only).

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 10)
- `status` (optional): Filter by status (active, pending, inactive)
- `search` (optional): Search by name or email

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "status": "active",
        "createdAt": "2023-05-01T12:00:00Z"
      }
      // More users...
    ],
    "pagination": {
      "total": 100,
      "pages": 10,
      "currentPage": 1,
      "limit": 10
    }
  }
}
```

### GET /users/:id

Get a specific user by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2023-05-01T12:00:00Z",
    "phone": "123-456-7890",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105"
    }
  }
}
```

### PUT /users/:id

Update a user's information.

**Request Body:**

```json
{
  "name": "John Smith",
  "phone": "123-456-7890",
  "address": {
    "street": "456 Market St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user123",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "phone": "123-456-7890",
    "address": {
      "street": "456 Market St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105"
    }
  }
}
```

### PATCH /users/:id/status

Update a user's status (admin only).

**Request Body:**

```json
{
  "status": "inactive"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "user123",
    "name": "John Smith",
    "status": "inactive"
  }
}
```

## Car Listing Endpoints

### GET /cars

Get a list of car listings.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 10)
- `sort` (optional): Sort by field (price, year, mileage)
- `order` (optional): Sort order (asc, desc)
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `minYear` (optional): Minimum year
- `maxYear` (optional): Maximum year
- `make` (optional): Car make
- `model` (optional): Car model
- `status` (optional): Listing status (active, pending, sold, draft)

**Response:**

```json
{
  "success": true,
  "data": {
    "cars": [
      {
        "id": "car123",
        "title": "2018 Toyota Camry XSE",
        "year": "2018",
        "make": "Toyota",
        "model": "Camry XSE",
        "price": "19500",
        "mileage": "45000",
        "description": "Well maintained Toyota Camry with low mileage...",
        "condition": "Excellent",
        "location": "San Francisco, CA",
        "status": "active",
        "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
        "seller": {
          "id": "user456",
          "name": "Sarah Johnson"
        },
        "createdAt": "2023-05-01T12:00:00Z"
      }
      // More cars...
    ],
    "pagination": {
      "total": 200,
      "pages": 20,
      "currentPage": 1,
      "limit": 10
    }
  }
}
```

### GET /cars/:id

Get details for a specific car listing.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "car123",
    "title": "2018 Toyota Camry XSE",
    "year": "2018",
    "make": "Toyota",
    "model": "Camry XSE",
    "price": "19500",
    "mileage": "45000",
    "description": "Well maintained Toyota Camry with low mileage...",
    "condition": "Excellent",
    "location": "San Francisco, CA",
    "status": "active",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "features": ["Leather seats", "Sunroof", "Premium sound system"],
    "seller": {
      "id": "user456",
      "name": "Sarah Johnson",
      "phone": "555-123-4567",
      "email": "sarah@example.com"
    },
    "createdAt": "2023-05-01T12:00:00Z",
    "updatedAt": "2023-05-10T14:30:00Z"
  }
}
```

### POST /cars

Create a new car listing.

**Request Body:**

```json
{
  "year": "2020",
  "make": "Honda",
  "model": "Accord Sport",
  "price": "23800",
  "mileage": "28000",
  "description": "One owner Honda Accord in pristine condition...",
  "condition": "Excellent",
  "location": "Oakland, CA",
  "features": ["Honda Sensing", "Apple CarPlay", "Heated seats"],
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Car listing created successfully",
  "data": {
    "id": "car456",
    "title": "2020 Honda Accord Sport",
    "year": "2020",
    "make": "Honda",
    "model": "Accord Sport",
    "price": "23800",
    "mileage": "28000",
    "description": "One owner Honda Accord in pristine condition...",
    "condition": "Excellent",
    "location": "Oakland, CA",
    "status": "active",
    "features": ["Honda Sensing", "Apple CarPlay", "Heated seats"],
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "seller": {
      "id": "user123",
      "name": "John Smith"
    },
    "createdAt": "2023-05-15T09:45:00Z"
  }
}
```

### PUT /cars/:id

Update a car listing.

**Request Body:**

```json
{
  "price": "22500",
  "description": "Updated description with new features...",
  "status": "active",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg", "https://example.com/image3.jpg"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Car listing updated successfully",
  "data": {
    "id": "car456",
    "title": "2020 Honda Accord Sport",
    "price": "22500",
    "description": "Updated description with new features...",
    "status": "active",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg", "https://example.com/image3.jpg"],
    "updatedAt": "2023-05-20T14:20:00Z"
  }
}
```

### PATCH /cars/:id/status

Update a car listing's status.

**Request Body:**

```json
{
  "status": "sold"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Car listing status updated successfully",
  "data": {
    "id": "car456",
    "title": "2020 Honda Accord Sport",
    "status": "sold",
    "updatedAt": "2023-05-25T16:10:00Z"
  }
}
```

### DELETE /cars/:id

Delete a car listing.

**Response:**

```json
{
  "success": true,
  "message": "Car listing deleted successfully"
}
```

## Service Provider Endpoints

### GET /service-providers

Get a list of service providers.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 10)
- `location` (optional): Filter by location
- `specialty` (optional): Filter by specialty
- `verified` (optional): Filter by verification status (true/false)
- `rating` (optional): Filter by minimum rating

**Response:**

```json
{
  "success": true,
  "data": {
    "serviceProviders": [
      {
        "id": "sp123",
        "name": "AutoCare Express",
        "image": "https://example.com/autocare.jpg",
        "rating": 4.8,
        "specialties": ["Oil Change", "Brake Service", "Tire Replacement"],
        "location": "San Francisco, CA",
        "verified": true
      }
      // More service providers...
    ],
    "pagination": {
      "total": 50,
      "pages": 5,
      "currentPage": 1,
      "limit": 10
    }
  }
}
```

### GET /service-providers/:id

Get details for a specific service provider.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sp123",
    "name": "AutoCare Express",
    "description": "Full-service auto repair shop specializing in domestic and foreign vehicles...",
    "image": "https://example.com/autocare.jpg",
    "gallery": ["https://example.com/gallery1.jpg", "https://example.com/gallery2.jpg"],
    "rating": 4.8,
    "reviewCount": 124,
    "specialties": ["Oil Change", "Brake Service", "Tire Replacement", "Engine Repair"],
    "services": [
      {
        "id": "serv1",
        "name": "Oil Change",
        "description": "Full synthetic oil change with filter replacement",
        "price": 49.99
      },
      {
        "id": "serv2",
        "name": "Brake Inspection",
        "description": "Complete brake system inspection",
        "price": 29.99
      }
    ],
    "location": {
      "address": "123 Auto Blvd",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105"
    },
    "hours": {
      "monday": "8:00 AM - 6:00 PM",
      "tuesday": "8:00 AM - 6:00 PM",
      "wednesday": "8:00 AM - 6:00 PM",
      "thursday": "8:00 AM - 6:00 PM",
      "friday": "8:00 AM - 6:00 PM",
      "saturday": "9:00 AM - 5:00 PM",
      "sunday": "Closed"
    },
    "phone": "555-123-4567",
    "email": "service@autocare.com",
    "website": "https://autocare-express.com",
    "verified": true
  }
}
```

### POST /service-providers

Create a new service provider profile.

**Request Body:**

```json
{
  "name": "Quick Fix Auto",
  "description": "Specialized auto repair for European vehicles...",
  "image": "https://example.com/quickfix.jpg",
  "gallery": ["https://example.com/gallery1.jpg", "https://example.com/gallery2.jpg"],
  "specialties": ["European Cars", "Electrical Systems", "Diagnostics"],
  "services": [
    {
      "name": "Diagnostic Scan",
      "description": "Computer diagnostic scan for European vehicles",
      "price": 89.99
    },
    {
      "name": "Electrical Repair",
      "description": "Electrical system troubleshooting and repair",
      "price": 120.00
    }
  ],
  "location": {
    "address": "456 Mechanic Lane",
    "city": "Oakland",
    "state": "CA",
    "zipCode": "94607"
  },
  "hours": {
    "monday": "8:00 AM - 5:00 PM",
    "tuesday": "8:00 AM - 5:00 PM",
    "wednesday": "8:00 AM - 5:00 PM",
    "thursday": "8:00 AM - 5:00 PM",
    "friday": "8:00 AM - 5:00 PM",
    "saturday": "Closed",
    "sunday": "Closed"
  },
  "phone": "555-987-6543",
  "email": "info@quickfixauto.com",
  "website": "https://quickfixauto.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Service provider profile created successfully",
  "data": {
    "id": "sp456",
    "name": "Quick Fix Auto",
    "verified": false,
    "createdAt": "2023-05-15T10:30:00Z"
  }
}
```

### PATCH /service-providers/:id/verify

Verify a service provider (admin only).

**Request Body:**

```json
{
  "verified": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Service provider verification status updated",
  "data": {
    "id": "sp456",
    "name": "Quick Fix Auto",
    "verified": true
  }
}
```

## Service Booking Endpoints

### GET /bookings

Get a list of service bookings.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 10)
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled)

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking123",
        "serviceProvider": {
          "id": "sp123",
          "name": "AutoCare Express"
        },
        "service": {
          "id": "serv1",
          "name": "Oil Change"
        },
        "date": "2023-06-15",
        "time": "10:00 AM",
        "status": "confirmed",
        "createdAt": "2023-05-20T14:30:00Z"
      }
      // More bookings...
    ],
    "pagination": {
      "total": 35,
      "pages": 4,
      "currentPage": 1,
      "limit": 10
    }
  }
}
```

### POST /bookings

Create a new service booking.

**Request Body:**

```json
{
  "serviceProviderId": "sp123",
  "serviceId": "serv1",
  "date": "2023-06-15",
  "time": "10:00 AM",
  "notes": "Please check the tire pressure as well"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking123",
    "serviceProvider": {
      "id": "sp123",
      "name": "AutoCare Express"
    },
    "service": {
      "id": "serv1",
      "name": "Oil Change",
      "price": 49.99
    },
    "date": "2023-06-15",
    "time": "10:00 AM",
    "status": "pending",
    "notes": "Please check the tire pressure as well",
    "createdAt": "2023-05-20T14:30:00Z"
  }
}
```

### PATCH /bookings/:id/status

Update a booking status.

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "id": "booking123",
    "status": "confirmed",
    "updatedAt": "2023-05-21T09:15:00Z"
  }
}
```

## Notification Endpoints

### GET /notifications

Get a list of user notifications.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 10)
- `read` (optional): Filter by read status (true/false)

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif123",
        "title": "Booking Confirmed",
        "description": "Your service booking with AutoCare Express has been confirmed",
        "type": "booking",
        "read": false,
        "createdAt": "2023-05-21T09:20:00Z"
      },
      {
        "id": "notif124",
        "title": "New Message",
        "description": "You have a new message from Sarah regarding your Honda Accord listing",
        "type": "message",
        "read": true,
        "createdAt": "2023-05-20T15:45:00Z"
      }
      // More notifications...
    ],
    "pagination": {
      "total": 25,
      "pages": 3,
      "currentPage": 1,
      "limit": 10
    }
  }
}
```

### PATCH /notifications/:id

Mark a notification as read.

**Request Body:**

```json
{
  "read": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification updated successfully",
  "data": {
    "id": "notif123",
    "read": true
  }
}
```

### PATCH /notifications/read-all

Mark all notifications as read.

**Response:**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

## Error Responses

All API endpoints return a standardized error format:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource could not be found",
    "details": "Car with ID 'car999' does not exist"
  }
}
```

Common error codes:

- `INVALID_REQUEST`: The request is malformed or contains invalid data
- `AUTHENTICATION_REQUIRED`: Authentication is required for this endpoint
- `PERMISSION_DENIED`: User does not have permission to access the resource
- `RESOURCE_NOT_FOUND`: The requested resource does not exist
- `VALIDATION_ERROR`: The request data failed validation
- `SERVER_ERROR`: An unexpected server error occurred

## Rate Limiting

API requests are rate-limited to 100 requests per minute per IP address. When the limit is exceeded, a 429 Too Many Requests status code is returned with the following response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "details": "Rate limit: 100 requests per minute"
  }
}
```

The response includes the following headers:
- `X-RateLimit-Limit`: The number of allowed requests in the current period
- `X-RateLimit-Remaining`: The number of remaining requests in the current period
- `X-RateLimit-Reset`: The time when the current rate limit window resets (Unix timestamp)
