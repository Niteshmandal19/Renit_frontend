import { useState } from 'react';
import { TextField, Button, Typography, Container, Rating } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ReviewItem = () => {
  const { id } = useParams<{ id: string }>();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:8000/api/reviews/', {
        item: id,
        rating,
        comment,
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Add Review</Typography>
      <Typography variant="h6" gutterBottom>Rating</Typography>
      <Rating
        value={rating}
        onChange={(event, newValue) => setRating(newValue)}
      />
      <TextField
        label="Comment"
        multiline
        rows={4}
        fullWidth
        margin="normal"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Submit Review</Button>
    </Container>
  );
};

export default ReviewItem;