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
    
    // 如果查询字符串不为空且不包含 =，则视为邀请码
    if (query && !query.includes('=')) {
      saveInviteCode(query);
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
