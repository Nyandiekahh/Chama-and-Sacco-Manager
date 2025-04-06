// src/components/common/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white p-4 shadow-inner text-center">
      <p className="text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Sacco Management System. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;