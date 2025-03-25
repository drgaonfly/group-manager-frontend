import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "./MainLayout";
import FloatingIcon from "../FloatingIcon";
import { saveInviteCode } from "../../utils/invite";


function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    // 获取完整的查询字符串，去掉开头的 ?
    const query = location.search.substring(1);
    
    // 解析查询参数
    const params = new URLSearchParams(query);
    const key = params.get('key');
    
    // 如果存在 key 参数，则保存为邀请码
    if (key) {
      saveInviteCode(key);
    }
  }, [location]);

  return (
    <MainLayout>
      <Outlet />
      <FloatingIcon />
    </MainLayout>
  );
}

export default RootLayout;
