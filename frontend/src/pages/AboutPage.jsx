import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import { FaInstagram, FaYoutube, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const defaultSocialLinks = [
  {
    name: 'instagram',
    url: 'https://www.instagram.com/itsrup79',
  },
  {
    name: 'youtube',
    url: 'https://www.youtube.com/@aparupchowdhury6679',
  },
  {
    name: 'linkedin',
    url: 'https://www.linkedin.com/in/aparup-chowdhury',
  },
];

const iconMap = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  linkedin: FaLinkedin,
};

const AboutPage = () => {
  const [siteInfo, setSiteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const founderEmail = 'aparupchowdhury79@gmail.com';

  useEffect(() => {
    const loadSiteInfo = async () => {
      try {
        const response = await api.get('/site-info');
        const fetchedInfo = response.data;
        if (fetchedInfo?.socialLinks?.length) {
          fetchedInfo.socialLinks = fetchedInfo.socialLinks.map((link) => {
            if (link.name === 'instagram') {
              return { ...link, url: 'https://www.instagram.com/itsrup79' };
            }
            if (link.name === 'twitter') {
              return {
                ...link,
                name: 'linkedin',
                url: 'https://www.linkedin.com/in/aparup-chowdhury',
              };
            }
            return link;
          });
        }
        setSiteInfo(fetchedInfo);
      } catch (error) {
        console.error('Failed to load site info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSiteInfo();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar showLogin={true} showSignup={true} />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 text-center">About Resonance</h1>
          
          <div className="mb-12 bg-gray-800 bg-opacity-50 p-8 rounded-lg">
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg mb-6">
              At Resonance, we're dedicated to creating a comprehensive ecosystem for musicians and music enthusiasts. 
              Our platform brings together studio bookings, instrument shopping, artist collaboration, and community building 
              in one seamless experience.
            </p>
            <p className="text-lg">
              We believe that music has the power to transform lives, and our mission is to make musical resources 
              accessible to everyone, from beginners to professional artists.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-3">For Artists</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Showcase your releases across multiple platforms</li>
                <li>Book professional recording studios</li>
                <li>Connect with other musicians for collaboration</li>
                <li>Access quality instruments through purchase or rental</li>
                <li>Build your artist profile and grow your audience</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-3">For Music Lovers</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Discover new artists and music</li>
                <li>Purchase quality instruments and accessories</li>
                <li>Rent instruments for practice or events</li>
                <li>Book practice rooms for your musical journey</li>
                <li>Earn points and discounts through our loyalty program</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-12 bg-gray-800 bg-opacity-50 p-8 rounded-lg">
            <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
            <p className="text-lg mb-4">
              Resonance was founded in 2025 for one of our undergraduate projects at Brac University. 
              It is still in development phase, but we are committed to launching a fully functional platform very soon.
            </p>
            <p className="text-lg mb-4">It was created by a group of musicians who understood the challenges of finding quality 
              studios, instruments, and collaborators. What started as a simple booking platform has evolved into 
              a comprehensive music solution.
            </p>
            <p className="text-lg">
              Through this platform, we aim to serve thousands of musicians across the country, providing them with the tools and resources 
              they need to create amazing music, in future. Our community continues to grow and we're excited about the future 
              of music creation and collaboration.
            </p>
          </div>
          
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-center">Connect With one of the founders</h2>
            <div className="text-center">
              {loading ? (
                <p className="text-gray-300">Loading contact information...</p>
              ) : (
                <>
                  <p className="mb-2">
                    <FaEnvelope className="inline mr-2 text-blue-400" />
                    Email: <a href={`mailto:${founderEmail}`} className="text-blue-300 hover:underline">{founderEmail}</a>
                  </p>
                  <p className="mb-2">
                    <FaPhone className="inline mr-2 text-green-400" />
                    Phone: {siteInfo?.phone ?? '+880 12345678'}
                  </p>
                  <p className="mb-2">
                    <FaMapMarkerAlt className="inline mr-2 text-purple-400" />
                    Address: {siteInfo?.address ?? 'Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212, Bangladesh'}
                  </p>
                  <p className="mt-4">
                    For support inquiries, please email{' '}
                    <a href={`mailto:${founderEmail}`} className="text-blue-400 hover:underline">
                      {founderEmail}
                    </a>
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-center space-x-8 mt-8">
              {(siteInfo?.socialLinks.length ? siteInfo.socialLinks : defaultSocialLinks).map((social) => {
                const Icon = iconMap[social.name] || FaInstagram;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center text-white hover:text-opacity-90 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 mb-2">
                      <Icon className="text-3xl" />
                    </div>
                    <span className="text-sm uppercase tracking-wider">{social.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
          
          

        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
