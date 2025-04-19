import { useState } from 'react';
import {  Button, Typography, Container } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('your_stripe_publishable_key');  // Replace with your key

const CheckoutForm = ({ bookingId }: { bookingId: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  // Inside handlePayment
const handlePayment = async () => {
    if (!stripe || !elements) return;
  
    const { data } = await axios.post('http://localhost:8000/api/create-checkout-session/', { booking_id: bookingId }, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
  
    const result = await stripe.redirectToCheckout({ sessionId: data.id });
  
    if (result.error) {
      console.error(result.error.message);
    } else {
      if (Notification.permission === 'granted') {
        new Notification('Booking Confirmed!', { body: 'Your payment was successful.' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Booking Confirmed!', { body: 'Your payment was successful.' });
          }
        });
      }
      navigate('/success');
    }
  };

  return (
    <div>
      <CardElement />
      <Button variant="contained" onClick={handlePayment} sx={{ mt: 2 }}>Pay Now</Button>
    </div>
  );
};

const BookItem = () => {
  const { id } = useParams<{ id: string }>();
  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);
//   const navigate = useNavigate();

  const handleBooking = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/bookings/', {
        item_id: id,
        start_time: startTime?.toISOString(),
        end_time: endTime?.toISOString(),
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setBookingId(response.data.id);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Booking failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Book Item</Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Start Time"
          value={startTime}
          onChange={(newValue) => setStartTime(newValue)}
          sx={{ mt: 2, width: '100%' }}
        />
        <DateTimePicker
          label="End Time"
          value={endTime}
          onChange={(newValue) => setEndTime(newValue)}
          sx={{ mt: 2, width: '100%' }}
        />
      </LocalizationProvider>
      {!bookingId ? (
        <Button variant="contained" onClick={handleBooking} sx={{ mt: 2 }}>Create Booking</Button>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutForm bookingId={bookingId} />
        </Elements>
      )}
    </Container>
  );

};
export default BookItem;