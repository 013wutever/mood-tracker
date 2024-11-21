import React, { useState, useEffect } from 'react';

const GlassmorphicContainer = ({ 
  children, 
  className = '', 
  hover = false,
  active = false,
  onClick = null,
  as = 'div'
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getStyles = () => {
    if (isMobile) {
      return `
        ${className}
        ${hover ? 'active:scale-95 transition-transform' : ''}
        ${active ? 'bg-white/20' : 'bg-white/10'}
        backdrop-blur-sm
      `;
    }

    return `
      ${className}
      ${hover ? 'hover:bg-white/15 hover:scale-105 active:scale-95' : ''}
      ${active ? 'bg-white/20 scale-105' : 'bg-white/10'}
      backdrop-blur-lg border border-white/20
      transition-all duration-300
      shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06),inset_0_0_80px_rgba(255,255,255,0.1)]
      ${hover ? 'hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05),inset_0_0_80px_rgba(255,255,255,0.2)]' : ''}
    `;
  };

  const Component = as;

  return (
    <Component 
      className={getStyles()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </Component>
  );
};

export default GlassmorphicContainer;
