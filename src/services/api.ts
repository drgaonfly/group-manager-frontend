// @ts-ignore
/* eslint-disable */
import type { MenuDataItem } from '@ant-design/pro-components';
import { request } from '@umijs/max';

interface menuResponse {
  success: boolean;
  data: MenuDataItem[];
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.CurrentUser>('/auth/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function fetchMenuData() {
  return request<menuResponse>('/menus/fetch', {
    method: 'GET',
  });
}

/** 退出登录接口 POST /api/login/outLogin */
/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>(`/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function refreshToken(body: API.refreshParams, options?: { [key: string]: any }) {
  return request<API.RefreshResult>(`/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function queryDataList(
  url: string,
  params: { [key: string]: any },
  sort?: { [key: string]: any },
  filter?: { [key: string]: any },
) {
  const res = await request<API.ResData>(url, {
    method: 'POST',
    params: {
      ...params,
      page: params.current,
      limit: params.pageSize,
      sorter: sort,
      ...filter,
    },
  });

  let data;

  if (Array.isArray(res.data)) {
    data = res.data;
  } else {
    data = res.data.data;
  }

  return {
    success: res.code === 1,
    data,
    total: res.data.total,
  };
}

export async function queryList(
  url: string,
  params?: { [key: string]: any },
  sort?: { [key: string]: any },
  filter?: { [key: string]: any },
) {
  return request<API.DataList>(url, {
    method: 'GET',
    params: {
      ...params,
      page: params!.current,
      limit: params!.pageSize,
      sorter: sort,
      ...filter,
    },
  });
}

/**
 * Simple GET request without pagination
 * @param url - API endpoint
 * @param params - Request parameters
 */
export async function simpleGet<T = any>(url: string, params?: { [key: string]: any }) {
  return request<T>(url, {
    method: 'GET',
    params,
  });
}

export async function addItem(url: string, options?: { [key: string]: any }) {
  return request<API.ItemData>(url, {
    method: 'POST',
    data: {
      ...(options || {}),
    },
  });
}

export async function updateItem(url: string, options?: { [key: string]: any }) {
  return request<API.ListItem>(url, {
    method: 'PUT',
    data: {
      ...(options || {}),
    },
  });
}

export async function handleItem(url: string, options?: { [key: string]: any }) {
  return request<API.ResponseData>(url, {
    method: 'PATCH',
    data: {
      ...(options || {}),
    },
  });
}

export async function removeItem(url: string, options?: { [key: string]: any }) {
  return request<Record<string, any>>(url, {
    method: 'DELETE',
    data: {
      ...(options || {}),
    },
  });
}

/** 超级管理员：将源机器人功能配置复制到目标机器人 POST /bots/copy-feature-config */
export async function copyBotFeatureConfig(body: { sourceBotId: string; targetBotId: string }) {
  return request<{ success: boolean; data?: any; message?: string }>('/bots/copy-feature-config', {
    method: 'POST',
    data: body,
  });
}
