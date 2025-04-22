// 保存邀请码到 sessionStorage
export const saveInviteCode = (code: string) => {
  localStorage.setItem("inviteCode", code);
};

// 获取邀请码
export const getInviteCode = () => {
  return localStorage.getItem("inviteCode");
};

// 清除邀请码
export const clearInviteCode = () => {
  localStorage.removeItem("inviteCode");
};

//下面是customer邀请customer

// 保存邀请人码到 localStorage
export const saveInviterCode = (code: string) => {
  localStorage.setItem("inviterCode", code);
};

// 获取邀请人码
export const getInviterCode = () => {
  return localStorage.getItem("inviterCode");
};

// 清除邀请人码
export const clearInviterCode = () => {
  localStorage.removeItem("inviterCode");
};
