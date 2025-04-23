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
  localStorage.setItem("inviterCodeByCustomer", code);
};

// 获取客户邀请人码
export const getCustomerInviterCode = () => {
  return localStorage.getItem("inviterCodeByCustomer");
};

// 清除客户邀请人码
export const clearCustomerInviterCode = () => {
  localStorage.removeItem("inviterCodeByCustomer");
};

// 获取邀请码（优先返回代理邀请码，如果没有则返回客户邀请码）
// export const getInviteCode = () => {
//   const agentCode = getAgentInviteCode();
//   if (agentCode) {
//     return agentCode;
//   }
//   return getCustomerInviterCode();
// };
