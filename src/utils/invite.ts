// 保存邀请码到 sessionStorage
export const saveInviteCode = (code: string) => {
  sessionStorage.setItem('inviteCode', code);
};

// 获取邀请码
export const getInviteCode = () => {
  return sessionStorage.getItem('inviteCode');
};

// 清除邀请码
export const clearInviteCode = () => {
  sessionStorage.removeItem('inviteCode');
};