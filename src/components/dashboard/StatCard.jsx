// src/components/dashboard/StatCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, linkTo, className = '' }) => {
  return (
    <Link to={linkTo} className={`block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StatCard;