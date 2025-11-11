
import React from 'react';

export const ShuffleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="16 3 21 3 21 8"></polyline>
    <line x1="4" y1="20" x2="21" y2="3"></line>
    <polyline points="16 17 21 17 21 22"></polyline>
    <line x1="4" y1="14" x2="11" y2="7"></line>
    <polyline points="4 7 4 3 8 3"></polyline>
  </svg>
);