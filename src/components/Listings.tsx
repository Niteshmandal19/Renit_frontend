import { useEffect, useState } from 'react';
import axios from 'axios';
import { Rating, Chip, CircularProgress, Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MapView from './MapView';


interface Category {
  id: number;
  name: string;
  description: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  location: string;
  available: boolean;
  owner: number;
  category: Category | null;
  price: string;
  photo: string | null;
  reviews: Review[];
  latitude: number | null;
  longitude: number | null;
}

const Listings = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const navigate = useNavigate();
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, itemsResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/categories/', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:8000/api/items/', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setCategories(categoriesResponse.data);
        
        // Sort the items based on user preference
        let sortedItems = itemsResponse.data;
        if (sortBy === 'price-asc') {
          sortedItems = sortedItems.sort((a: Item, b: Item) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === 'price-desc') {
          sortedItems = sortedItems.sort((a: Item, b: Item) => parseFloat(b.price) - parseFloat(a.price));
        } else if (sortBy === 'rating') {
          sortedItems = sortedItems.sort((a: Item, b: Item) => {
            const aRating = a.reviews.length ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0;
            const bRating = b.reviews.length ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0;
            return bRating - aRating;
          });
        }
        
        setItems(sortedItems);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, selectedCategory, minPrice, maxPrice, location, sortBy]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/items/${id}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    // The useEffect hook will handle the actual filtering
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSearch('');
  };

  const getAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  };

  // Calculate pagination
  const filteredItems = selectedCategory
    ? items.filter(item => item.category?.id === selectedCategory)
    : items;
    
  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const pageCount = Math.ceil(filteredItems.length / itemsPerPage);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <CircularProgress />
      <p className="ml-4 text-gray-200">Loading amazing rentals for you...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">Find Your Perfect Rental</h1>
          <p className="text-gray-400">Discover unique items available in your area</p>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <div className="relative">
                <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                More Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="$0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="$100"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or ZIP"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Best Rated</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
                >
                  Reset
                </button>
                <button 
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-gray-200">
            {filteredItems.length} {filteredItems.length === 1 ? 'Result' : 'Results'} Found
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'border border-gray-600 text-gray-300 hover:bg-gray-700'}`}
            >
              Grid View
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-500 text-white' : 'border border-gray-600 text-gray-300 hover:bg-gray-700'}`}
            >
              Map View
            </button>
          </div>
        </div>

        {/* Results */}
        {filteredItems.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">No items match your criteria</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search terms to find more options</p>
            <button 
              onClick={resetFilters}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedItems.map(item => (
                  <div key={item.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:transform hover:-translate-y-1 transition duration-300">
                    <div className="relative">
                      <img
                        src={item.photo || '/placeholder-image.jpg'}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      {!item.available && (
                        <Chip 
                          label="Currently Booked" 
                          color="error" 
                          size="small"
                          className="absolute top-2 right-2"
                        />
                      )}
                      <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ${item.price}/day
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2 truncate">{item.title}</h3>
                      
                      {item.category && (
                        <span className="inline-block bg-purple-600 text-white px-2 py-1 rounded-full text-xs mb-2">
                          {item.category.name}
                        </span>
                      )}
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.location}
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <Rating 
                          value={getAverageRating(item.reviews)} 
                          precision={0.5} 
                          size="small" 
                          readOnly 
                          sx={{ color: '#60a5fa' }}
                        />
                        <span className="text-gray-400 text-sm ml-2">({item.reviews.length})</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/book-item/${item.id}`)}
                          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Book Now
                        </button>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => navigate(`/chat/${item.id}`)}
                            className="p-2 hover:bg-gray-700 rounded-lg"
                            title="Chat with owner"
                          >
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => navigate(`/edit-item/${item.id}`)}
                            className="p-2 hover:bg-gray-700 rounded-lg"
                            title="Edit item"
                          >
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg"
                            title="Delete item"
                          >
                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-screen-75 rounded-lg overflow-hidden">
                <MapView items={filteredItems} onItemClick={(id) => navigate(`/book-item/${id}`)} />
              </div>
            )}
            
            {/* Pagination */}
            {filteredItems.length > itemsPerPage && (
              <div className="flex justify-center mt-8">
                <Pagination 
                  count={pageCount} 
                  page={page} 
                  onChange={(e, value) => setPage(value)} 
                  color="primary"
                  sx={{
                    '.MuiPaginationItem-root': {
                      color: '#9ca3af',
                    },
                    '.Mui-selected': {
                      backgroundColor: '#3b82f6 !important',
                      color: 'white !important',
                    },
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Listings;