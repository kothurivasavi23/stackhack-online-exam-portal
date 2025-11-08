import React from 'react';

const ExamPortalLogo = ({ size = "normal", className = "" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    normal: "w-12 h-12",
    large: "w-16 h-16"
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Modern exam portal logo */}
        <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#gradient)"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        
        {/* Book/Exam icon */}
        <path d="M20 18L32 12L44 18V44C44 44 32 50 32 50C32 50 20 44 20 44V18Z" 
              stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* Lines representing text/questions */}
        <path d="M26 26H38" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M26 32H36" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M26 38H38" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        
        {/* Checkmark badge */}
        <circle cx="46" cy="20" r="6" fill="#10B981"/>
        <path d="M43 20L45 22L49 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

export default ExamPortalLogo;

