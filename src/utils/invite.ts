// 保存邀请码到 localStorage
export const saveInviteCode = (code: string) => {
  localStorage.setItem('inviteCode', code);
};

// 获取邀请码
export const getInviteCode = () => {
  return localStorage.getItem('inviteCode');
};

// 清除邀请码
export const clearInviteCode = () => {
  localStorage.removeItem('inviteCode');
};