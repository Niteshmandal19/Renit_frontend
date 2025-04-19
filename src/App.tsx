import { Container } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Listings from './components/Listings';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import BookItem from './pages/BookItem';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import ReviewItem from './pages/ReviewItem';
import Chat from './pages/Chat';

function App() {
  return (
    <>
      <Header />
        <Routes>
          <Route path="/" element={<Listings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/edit-item/:id" element={<EditItem />} />
          <Route path="/book-item/:id" element={<BookItem />} />
          <Route path="/review-item/:id" element={<ReviewItem />} />
          <Route path="/chat/:itemId" element={<Chat />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
    </>
  );
}

export default App;