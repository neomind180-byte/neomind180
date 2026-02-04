import React from 'react';

export const Logo = ({ className = "w-8 h-8" }) => (
  <img 
    src="/business-logo.png" 
    alt="NeoMind180 Logo" 
    className={`${className} object-contain`} 
  />
);