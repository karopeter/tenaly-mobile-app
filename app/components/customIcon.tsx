import React from 'react';
import Svg, { Polygon, Rect } from 'react-native-svg';

export const CustomHomeIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Roof */}
    <Polygon points="50,10 90,60 10,60" fill="#00A8DF" />
    {/* Body */}
    <Rect x="20" y="60" width="60" height="40" fill="#1031AA" />
    {/* Door */}
    <Rect x="40" y="70" width="10" height="30" fill="#FFFFFF" />
    {/* Window */}
    <Rect x="55" y="70" width="8" height="20" fill="#FFFFFF" />
  </Svg>
);