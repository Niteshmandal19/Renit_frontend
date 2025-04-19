import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
  description: string;
}

const AddItem = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/categories/',{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
  })
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('price', price);
    formData.append('category_id', String(categoryId));
    if (photo) formData.append('photo', photo);

    try {
      await axios.post('http://localhost:8000/api/items/', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Add New Item</Typography>
      <TextField label="Title" fullWidth margin="normal" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextField label="Description" fullWidth margin="normal" value={description} onChange={(e) => setDescription(e.target.value)} />
      <TextField label="Location" fullWidth margin="normal" value={location} onChange={(e) => setLocation(e.target.value)} />
      <TextField label="Price (per day)" type="number" fullWidth margin="normal" value={price} onChange={(e) => setPrice(e.target.value)} />
      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value as number)}>
          <MenuItem value="">Select Category</MenuItem>
          {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
        </Select>
      </FormControl>
      <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} style={{ margin: '20px 0' }} />
      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Add Item</Button>
    </Container>
  );
};

export default AddItem;