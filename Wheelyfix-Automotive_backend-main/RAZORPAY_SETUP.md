# Razorpay Integration Setup Guide

## Overview
This guide explains how to set up Razorpay payment integration for the Wheelyfix Automotive project.

## Backend Setup

### 1. Environment Variables
Update your `.env` file with your Razorpay credentials:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

### 2. Dependencies
The Razorpay package is already installed:
```bash
npm install razorpay
```

### 3. API Endpoints

#### Payment Configuration
- **GET** `/api/payments/config` - Get Razorpay configuration
- **POST** `/api/payments/create-order` - Create payment order
- **POST** `/api/payments/verify` - Verify payment signature

#### Booking with Payment
- **POST** `/api/bookings` - Create booking with optional payment
- **PUT** `/api/bookings/:id/payment` - Update booking payment status

### 4. Database Schema Updates

#### Booking Model
Added payment-related fields:
- `paymentStatus`: 'pending' | 'paid' | 'failed' | 'refunded'
- `paymentId`: Razorpay payment ID
- `razorpayOrderId`: Razorpay order ID
- `amount`: Amount in paise
- `currency`: Currency (default: 'INR')

#### Payment Model
Tracks payment transactions:
- `user`: User reference
- `orderId`: Razorpay order ID
- `paymentId`: Razorpay payment ID
- `amount`: Amount in paise
- `currency`: Currency
- `status`: 'created' | 'paid' | 'failed'
- `receipt`: Receipt number

## Frontend Setup

### 1. Razorpay Script
The Razorpay checkout script is loaded dynamically in the `RazorpayPayment` component.

### 2. Components

#### RazorpayPayment Component
- Handles payment initialization
- Manages payment success/failure callbacks
- Verifies payment on backend

#### PaymentStatus Component
- Displays payment status with appropriate icons
- Shows payment ID and amount

### 3. Integration Points

#### Booking Page
- Shows service pricing
- Creates payment order when booking
- Displays payment interface after booking creation

#### Dashboard
- Shows payment status for each booking
- Displays payment information

## Testing

### 1. Test Mode
Use Razorpay test credentials for development:
- Test cards: https://razorpay.com/docs/payment-gateway/test-cards/
- Test UPI: Use any UPI ID

### 2. Test Flow
1. Create a booking with payment
2. Complete payment using test card
3. Verify payment status in dashboard
4. Check database for payment records

## Security Notes

1. **Never expose secret key** in frontend code
2. **Always verify payment signature** on backend
3. **Use HTTPS** in production
4. **Validate amounts** before processing
5. **Log all payment events** for debugging

## Production Setup

1. Replace test credentials with live credentials
2. Update webhook URLs
3. Enable signature verification
4. Set up proper error handling
5. Configure refund policies

## Troubleshooting

### Common Issues
1. **Payment verification fails**: Check secret key and signature generation
2. **Order creation fails**: Verify API keys and network connectivity
3. **Frontend errors**: Check Razorpay script loading

### Debug Steps
1. Check browser console for errors
2. Verify API responses
3. Check database records
4. Review server logs

## Support
- Razorpay Documentation: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payment-gateway/test-cards/
- Support: https://razorpay.com/support/
