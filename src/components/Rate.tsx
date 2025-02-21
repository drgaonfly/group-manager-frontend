import React from 'react';

interface RateProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const Rate: React.FC<RateProps> = ({ icon, title, content }) => {
  return (
    <div className="bg-[#1e2633] rounded-lg p-4 shadow-md text-white text-center">

      <div className="flex items-center space-x-2 justify-center">
        <div className="w-14 h-14">{icon}</div>
      </div>

      <h3 className="text-sm font-normal text-gray-400">{title}</h3>

      <p className="mt-2 text-white-400 text-base">{content}</p>
    </div>
  );
};

export default Rate;
