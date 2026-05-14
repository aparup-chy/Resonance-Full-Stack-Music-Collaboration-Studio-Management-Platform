import React, { useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const ImageGalleryModal = ({ images, currentIndex, onClose, onNextImage, onPrevImage }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        onNextImage();
      } else if (e.key === 'ArrowLeft') {
        onPrevImage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextImage, onPrevImage, onClose]);

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-50 p-2 rounded-full hover:bg-white/10"
        aria-label="Close gallery"
        type="button"
      >
        <FaTimes size={28} />
      </button>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`Product image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Left Arrow */}
        {images.length > 1 && (
          <button
            onClick={onPrevImage}
            className="absolute left-6 text-white hover:text-gray-300 transition-colors z-50 p-2 rounded-full hover:bg-white/10"
            aria-label="Previous image"
            type="button"
          >
            <FaChevronLeft size={32} />
          </button>
        )}

        {/* Right Arrow */}
        {images.length > 1 && (
          <button
            onClick={onNextImage}
            className="absolute right-6 text-white hover:text-gray-300 transition-colors z-50 p-2 rounded-full hover:bg-white/10"
            aria-label="Next image"
            type="button"
          >
            <FaChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Image Counter and Thumbnails Container */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Image Counter */}
          <div className="text-center text-white text-sm mb-4">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Thumbnail Strip */}
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  // Calculate direction and move accordingly
                  if (index > currentIndex) {
                    for (let i = currentIndex; i < index; i++) {
                      onNextImage();
                    }
                  } else if (index < currentIndex) {
                    for (let i = currentIndex; i > index; i--) {
                      onPrevImage();
                    }
                  }
                }}
                className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                    : 'border-white/30 hover:border-white/60'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Controls Info */}
          <div className="text-center text-white text-xs text-gray-400 mt-2">
            <span>Use arrow keys • Click arrows to navigate • ESC to close</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryModal;
