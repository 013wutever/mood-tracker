import React, { useState, useEffect } from 'react';

const GlassmorphicContainer = ({ 
  children, 
  className = '', 
  hover = false,
  active = false,
  onClick = null,
  as = 'div',
  style = {}
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getStyles = () => {
    // Mobile styles - simplified with solid background
    if (isMobile) {
      // If a custom background color is provided, use it, otherwise use default
      const defaultBg = 'rgba(255, 255, 255, 0.2)';
      return {
        backgroundColor: style.backgroundColor || defaultBg,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...style,
      };
    }

    // Desktop styles - full glassmorphic effect
    return {
      ...style,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 80px rgba(255, 255, 255, 0.1)'
    };
  };

  const getClassName = () => {
    const baseClasses = `
      ${className}
      transition-all duration-300
    `;

    if (isMobile) {
      return `
        ${baseClasses}
        ${hover ? 'active:scale-95' : ''}
        ${active ? 'bg-opacity-100' : 'bg-opacity-80'}
      `;
    }

    return `
      ${baseClasses}
      ${hover ? 'hover:bg-white/15 hover:scale-105 active:scale-95' : ''}
      ${active ? 'bg-white/20 scale-105' : 'bg-white/10'}
      backdrop-blur-lg border border-white/20
      ${hover ? 'hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05),inset_0_0_80px_rgba(255,255,255,0.2)]' : ''}
    `;
  };

  const Component = as;

  return (
    <Component 
      className={getClassName()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={getStyles()}
    >
      {children}
    </Component>
  );
};

export default GlassmorphicContainer;
