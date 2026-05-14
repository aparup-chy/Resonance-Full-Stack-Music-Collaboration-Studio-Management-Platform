import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imageUrl';
import { useCart } from '../context/CartContext';
import ImageGalleryModal from '../components/ImageGalleryModal';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedProductForGallery, setSelectedProductForGallery] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts();
  }, [selectedCategory, searchQuery, priceRange, selectedBrands]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');

      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/products/brands');
      setBrands(response.data.brands);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/products';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('minPrice', priceRange.min);
      params.append('maxPrice', priceRange.max);
      if (selectedBrands.length > 0) {
        selectedBrands.forEach(brand => params.append('brands', brand));
      }
      
      const response = await api.get(`${url}?${params.toString()}`);
      setProducts(response.data.products);
      console.log(response.data.products);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleOpenGallery = (product, startIndex = 0) => {
    setSelectedProductForGallery(product);
    setGalleryIndex(startIndex);
    setShowGalleryModal(true);
  };

  const handleCloseGallery = () => {
    setShowGalleryModal(false);
    setSelectedProductForGallery(null);
  };

  const handleNextImage = () => {
    if (selectedProductForGallery?.images) {
      setGalleryIndex((prev) => (prev + 1) % selectedProductForGallery.images.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedProductForGallery?.images) {
      setGalleryIndex((prev) => (prev - 1 + selectedProductForGallery.images.length) % selectedProductForGallery.images.length);
    }
  };

  const { addToCart } = useCart();

  const handleAddToCart = async (productId) => {
    try {
      const success = await addToCart(productId, 1);
      if (success) {
        toast.success('Product added to cart successfully!');
      } else {
        toast.error('Failed to add product to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(err.response?.data?.message || 'Failed to add product to cart');
    }
  };


  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-white text-xl">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar />
      <div className="flex-1 p-8">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold text-white mb-8 leading-tight">Musical Instruments</h1>
          
          {/* Search and Filters */}
          <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <h3 className="text-white font-semibold mb-2">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      selectedCategory === 'all' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        selectedCategory === category 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h3 className="text-white font-semibold mb-2">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-2 font-medium">Min ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Max ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                    />
                  </div>
                </div>
              </div>
              
              {/* Brands */}
              <div>
                <h3 className="text-white font-semibold mb-2">Brands</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="rounded text-blue-600 focus:ring-blue-500 bg-white/10 border-white/30"
                      />
                      <label htmlFor={`brand-${brand}`} className="ml-2 text-white">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          {error ? (
            <div className="bg-red-500 text-white p-4 rounded-md mb-6">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white text-center">
              No products found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-black/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/30 transition-transform hover:scale-105">
                  <div 
                    className="cursor-pointer group"
                    onClick={() => handleOpenGallery(product, 0)}
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={getImageUrl(product.images[0])} 
                        alt={product.name} 
                        className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity"
                      />
                      {product.images.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <span className="text-white text-sm font-medium">Click to view {product.images.length} images</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <a href={`/products/${product._id}`}>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                      <p className="text-white/70 text-sm">{product.brand}</p>
                      <p className="text-blue-400 font-bold mt-2">${product.price.toFixed(2)}</p>
                    </div>
                  </a>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Image Gallery Modal */}
      {showGalleryModal && selectedProductForGallery?.images && selectedProductForGallery.images.length > 0 && (
        <ImageGalleryModal
          images={selectedProductForGallery.images}
          currentIndex={galleryIndex}
          onClose={handleCloseGallery}
          onNextImage={handleNextImage}
          onPrevImage={handlePrevImage}
        />
      )}
    </div>
  );
};

export default ProductList;
