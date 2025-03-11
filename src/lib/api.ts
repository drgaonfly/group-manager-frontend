import axios, { AxiosResponse } from 'axios';
import { storage } from './utils';

export interface AuthResponse {
  user: User;
  jwt: string;
  refreshToken: string;
}

export interface User {
  _id: string;
  id: string;
  network?: string;
  address?: string;
  invitedBy?: string;
  email: string;
  name?: string;
  ownInviteCode?: string;
  usdtBalance?: number;
  isVerified?: boolean;
  isAuthorized?: boolean;
  ethPlatform?: number;
  usdtPlatform?: number;
  usdtStaking?: number;
}

export interface OKXResponse {
  code: string;
  msg: string;
  data: [
    {
      instId: string;
      last: string;
      askPx: string;
      bidPx: string;
      timestamp: string;
    },
  ];
}

export async function handleApiResponse<T>(response: AxiosResponse<T>): Promise<T> {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    console.error(JSON.stringify(response.data, null, 2));
    return Promise.reject(response.data);
  }
}

export function getUserProfile(): Promise<{ user: User | undefined }> {
  return axios({
    url: '/customer-auth/profile',
    method: 'GET',
  }).then(handleApiResponse);
}

export function loginWithEmailAndPassword(
  data: unknown,
): Promise<AuthResponse> {
  return axios({
    url: '/customer-auth/login',
    method: 'POST',
    data, // Axios will automatically stringify the object
  }).then(handleApiResponse);
}

export function registerWithEmailAndPassword(
  data: unknown,
): Promise<AuthResponse> {
  return axios({
    url: '/customer-auth/register',
    method: 'POST',
    data, // Axios will automatically stringify the object
  }).then(handleApiResponse);
}

export function refreshToken(refreshToken: string): Promise<AuthResponse> {
  return axios({
    url: '/customer-auth/refresh',
    method: 'POST',
    data: { refreshToken },
  }).then(handleApiResponse);
}

export function logout(): void {
  return storage.clearToken();
}



export function getExchangeRate(cryptoType1: string, cryptoType2: string): Promise<number> {
  return axios({
    url: `https://www.okx.com/api/v5/market/ticker?instId=${cryptoType1}-${cryptoType2}`,
    method: 'GET',
  }).then((response) => {
    if (response.data.code === '0' && response.data.data.length > 0) {
      return parseFloat(response.data.data[0].last);
    }
    throw new Error(`Failed to fetch ${cryptoType1}-${cryptoType2} exchange rate from OKX`);
  }).catch((error) => {
    console.error('Exchange rate fetch error:', error);
    throw new Error(`获取 ${cryptoType1}-${cryptoType2} 汇率失败`);
  });
}



