// 平台代理邀请客户
// 保存代理邀请码到 localStorage
export const saveAgentInviteCode = (code: string) => {
  localStorage.setItem("inviteCode", code);
};

// 获取代理邀请码
export const getAgentInviteCode = () => {
  return localStorage.getItem("inviteCode");
};

// 清除代理邀请码
export const clearAgentInviteCode = () => {
  localStorage.removeItem("inviteCode");
};

// 客户邀请客户
// 保存客户邀请人码到 localStorage
export const saveCustomerInviterCode = (code: string) => {
  localStorage.setItem("inviterCode", code);
};

// 获取客户邀请人码
export const getCustomerInviterCode = () => {
  return localStorage.getItem("inviterCode");
};

// 清除客户邀请人码
export const clearCustomerInviterCode = () => {
  localStorage.removeItem("inviterCode");
};
