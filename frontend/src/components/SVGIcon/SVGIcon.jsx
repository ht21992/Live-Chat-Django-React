import React from 'react';

const SVGIcon = ({ children, icon , width, height, viewBox, color, title,...rest }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={viewBox}
      fill={color}
      {...rest}
    >
       <title>{title}</title>
      {icon ? (<path d={icon} />) : (<>{children}</>)}
    </svg>
  );
};

export default SVGIcon;