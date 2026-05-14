import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black bg-opacity-50 text-center p-4">
      <div className="flex justify-center space-x-6 mb-4">
        <a href="https://www.instagram.com/itsrup79" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400">
          <i className="fab fa-instagram text-xl"></i> Instagram
        </a>
        <a href="https://www.youtube.com/@aparupchowdhury6679" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500">
          <i className="fab fa-youtube text-xl"></i> YouTube
        </a>
      </div>
      <p>© 2025 Resonance. All Rights Reserved</p>
    </footer>
  );
};

export default Footer;