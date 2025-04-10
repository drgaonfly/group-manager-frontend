import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { useUser } from "../lib/auth";
import { useNavigate } from "react-router-dom";

// interface ServiceLinkResponse {
//   success: boolean;
//   data: {
//     id: string;
//     key: string;
//     value: string;
//     parameter: string;
//     remark: string;
//     createdAt: string;
//     updatedAt: string;
//     _id: string;
//     __v: number;
//     serviceLink?: string;
//   };
// }

// 获取设置接口
// const fetchServiceLink = async (employee?: string) => {
//   const response = await axios.get<ServiceLinkResponse>(
//     employee ? "/settings/service-link" : "/settings/key",
//     {
//       params: employee ? { employee } : { key: "serviceLink" },
//     },
//   );

//   // 如果是登录用户，返回 serviceLink 字段
//   if (employee) {
//     return {
//       ...response.data,
//       data: {
//         ...response.data.data,
//         value: response.data.data.serviceLink,
//       },
//     };
//   }

//   return response.data;
// };

function FloatingService() {
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("floatingPosition");
    if (saved) {
      return JSON.parse(saved);
    }

    // 计算初始位置：右边中间
    const initialX = window.innerWidth - 98; // 距离右边 100px
    const initialY = window.innerHeight / 1.4; // 垂直居中

    return { x: initialX, y: initialY };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();

  // 获取用户信息
  // const { data: user } = useUser();

  // 获取客服链接
  // const { data: serviceData } = useQuery({
  //   queryKey: ["settings", "serviceLink", user?.employee],
  //   queryFn: () => fetchServiceLink(user?.employee),
  //   enabled: true,
  // });

  // 在组件挂载时清除 localStorage
  useEffect(() => {
    localStorage.removeItem("floatingPosition");

    // 组件卸载时也清除 localStorage
    return () => {
      localStorage.removeItem("floatingPosition");
    };
  }, []);

  // 限制坐标在屏幕范围内
  const constrainPosition = (x: number, y: number) => {
    const iconSize = 80; // 圆形容器的大小 (w-20 = 80px)
    return {
      x: Math.min(Math.max(0, x), window.innerWidth - iconSize),
      y: Math.min(Math.max(0, y), window.innerHeight - iconSize),
    };
  };

  // 处理鼠标点击开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  // 修改处理点击事件
  const handleClick = () => {
    if (!isDragging) {
      // 只有在非拖动状态下且有链接时才打开
      // window.open(serviceData.data.value, "_blank");
      navigate("/chats");
    }
  };

  useEffect(() => {
    // 处理鼠标移动
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const constrained = constrainPosition(newX, newY);
        setPosition(constrained);
      }
    };

    // 处理触摸移动
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        const newX = touch.clientX - dragOffset.x;
        const newY = touch.clientY - dragOffset.y;
        const constrained = constrainPosition(newX, newY);
        setPosition(constrained);
        e.preventDefault();
      }
    };

    // 处理窗口大小改变
    const handleResize = () => {
      // 清除 localStorage
      localStorage.removeItem("floatingPosition");

      // 重新计算位置：右边中间
      const newX = window.innerWidth - 98;
      const newY = window.innerHeight / 1.4;

      setPosition({ x: newX, y: newY });
    };

    // 处理结束拖动
    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchend", handleEnd);
    }

    // 监听窗口大小改变
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDragging, dragOffset, position]);

  return (
    <div
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      <div className="relative rounded-full flex items-center justify-center shadow-lg">
        <img
          src="/0cf6ed97155cbd0f14f73baecf971c82.png"
          alt="Floating"
          className="w-14 h-14 select-none object-contain"
          draggable="false"
        />
      </div>
    </div>
  );
}

export default FloatingService;
