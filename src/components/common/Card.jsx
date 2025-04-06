// src/components/common/Card.jsx
import React from 'react';

const Card = ({ title, children, className = '', titleClassName = '', bodyClassName = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className={`border-b p-4 ${titleClassName}`}>
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;