import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "./MainLayout";
import FloatingIcon from "../FloatingIcon";
import {
  saveAgentInviteCode,
  saveCustomerInviterCode,
} from "../../utils/invite";

function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    // 获取完整的查询字符串，去掉开头的 ?
    const query = location.search.substring(1);

    // 解析查询参数
    const params = new URLSearchParams(query);
    const key = params.get("key");
    const inviter = params.get("inviter");

    // 如果存在 key 参数，则保存为代理邀请码
    if (key) {
      saveAgentInviteCode(key);
    }

    // 如果存在 inviter 参数，则保存为客户邀请人码
    if (inviter) {
      saveCustomerInviterCode(inviter);
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
