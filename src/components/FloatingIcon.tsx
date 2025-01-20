import { useState, useEffect } from 'react';
import FloatingMessage from './FloatingMessage';
import FloatingService from './FloatingService';

function FloatingIcon() {
  const [showFloatingWindows, setShowFloatingWindows] = useState(false);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('floatingIconPosition');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // 初始位置：紧贴右侧
    const initialX = window.innerWidth -60;  // 距离右侧5%
    const initialY = window.innerHeight / 2;  // 垂直居中
    
    return { x: initialX, y: initialY };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleClick = () => {
    if (!isDragging) {
      setShowFloatingWindows(!showFloatingWindows);
    }
  };

  // 限制坐标在屏幕范围内，只允许上下移动
  const constrainPosition = (x: number, y: number) => {
    const iconSize = 60; // 图标大小
    return {
      x: window.innerWidth -60, // 固定在距离右侧5%的位置
      y: Math.min(Math.max(0, y), window.innerHeight - iconSize)
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newY = e.clientY - dragOffset.y;
        const constrained = constrainPosition(position.x, newY);
        setPosition(constrained);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        const newY = touch.clientY - dragOffset.y;
        const constrained = constrainPosition(position.x, newY);
        setPosition(constrained);
        e.preventDefault();
      }
    };

    // 处理窗口大小改变
    const handleResize = () => {
      // 清除 localStorage
      localStorage.removeItem('floatingIconPosition');
      
      // 重新计算位置：右边中间
      const newX = window.innerWidth -60; // 固定在距离右侧5%的位置
      const newY = window.innerHeight /2;
      
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    }

    // 监听窗口大小改变
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDragging, dragOffset, position]);

  return (
    <div>
      <div
        className="fixed z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
      >
        <div className="relative w-10 h-10 bg-gradient-to-r from-[#EAB308] to-[#3B82F6] rounded-full flex items-center justify-center shadow-lg">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="w-6 h-6"
              fill="white"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <div className="absolute -top-1 -right-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16" 
              height="16"
              className="w-4 h-4"
              fill="white"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
        </div>
      </div>

      {showFloatingWindows && (
        <>
          <FloatingMessage />
          <FloatingService />
        </>
      )}
    </div>
  );
}

export default FloatingIcon; 