import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

// 更新通知类型接口以匹配后端数据结构
interface Notification {
  _id: string;
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  customer: string;
  user: string;
}

interface NotificationResponse {
  success: boolean;
  data: Notification[];
  total: number;
  current: number;
  pageSize: number;
}

function Message() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get<NotificationResponse>('/notifications/getCustomerNotifications');
        console.log('Notifications response:', response.data);
        
        if (response.data?.success) {
          setNotifications(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1b1e]">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 bg-[#1a1b1e] z-10">
        <div className="flex items-center px-4 py-3">
          <button 
            onClick={() => window.history.back()} 
            className="text-white"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-white ml-4">{t('messages.title')}</span>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="pt-16 px-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-gray-400">{t('loading')}...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className="bg-[#2d2672] p-4 rounded-lg"
              >
                <h3 className="text-white font-bold mb-2">{notification.title}</h3>
                <p className="text-white mb-2">{notification.content}</p>
                <span className="text-gray-400 text-sm">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <img 
              src="/nors-BR_U97rM.png" 
              alt="no data" 
              className="w-24 h-24 mb-4 object-contain" 
            />
            <span className="text-gray-400">{t('messages.noData')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message; 