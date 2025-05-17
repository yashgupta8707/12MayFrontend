// components/quotation/StatsCard.jsx

import React from 'react';

const StatsCard = ({ title, value, icon, color, subtext }) => {
  // Colors: orange, blue, green, purple, gray
  const colorClasses = {
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-500',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-500',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-500',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-500',
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-500',
    },
  };
  
  const colorClass = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
          {subtext && <p className="text-sm text-gray-600 mt-1">{subtext}</p>}
        </div>
        <div className={`${colorClass.bg} p-3 rounded-full`}>
          {React.cloneElement(icon, { className: `h-6 w-6 ${colorClass.text}` })}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;