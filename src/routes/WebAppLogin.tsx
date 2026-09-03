import { message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const WebAppLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('正在登录...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const jwtToken = searchParams.get('jwtToken');
    const redirect = searchParams.get('redirect') || '/';

    setStatus('检查登录凭证...');

    if (jwtToken) {
      setStatus('保存登录凭证...');
      try {
        const decodedToken = decodeURIComponent(jwtToken);
        localStorage.setItem('token', decodedToken);
        setStatus('登录成功，正在跳转...');
        
        setTimeout(() => {
          navigate(redirect);
        }, 500);
      } catch (e: any) {
        const errorMsg = `保存凭证失败: ${e?.message || '未知错误'}`;
        setStatus('登录失败');
        setError(errorMsg);
        message.error('无法保存登录凭证');
      }
    } else {
      setStatus('登录失败');
      setError('缺少 jwtToken 参数');
      message.error('缺少登录凭证');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center max-w-md w-full">
        <Spin size="large" />
        <p className="mt-4 text-gray-600 text-base font-medium">{status}</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm break-words">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebAppLogin;