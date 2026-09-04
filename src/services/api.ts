// @ts-ignore
/* eslint-disable */
import axios from "axios";

/**
 * 带 Authorization header 的 axios 封装，签名与 umi request 兼容。
 * method / params / data 语义与 umi request 一致。
 */
export async function request<T = any>(
  url: string,
  options: {
    method?: string;
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
    requestType?: "json" | "form";
  } = {},
): Promise<T> {
  const { method = "GET", params, data, headers = {}, requestType } = options;

  console.log('url', url)

  const rawToken = localStorage.getItem("token");
  const token = rawToken ? JSON.parse(rawToken) : null;

  const res = await axios( `${import.meta.env.VITE_BACKEND_API_URL}/${url}` , {
    method,
    params,
    data,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(requestType === "form" ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  });

  console.log('request result', res)

  return res.data;
}

export async function queryList(
  url: string,
  params?: Record<string, any>,
  sort?: Record<string, any>,
  filter?: Record<string, any>,
) {
  return request<any>(url, {
    method: "GET",
    params: {
      ...params,
      page: params?.current,
      limit: params?.pageSize,
      sorter: sort,
      ...filter,
    },
  });
}

export async function simpleGet<T = any>(
  url: string,
  params?: Record<string, any>,
) {
  return request<T>(url, { method: "GET", params });
}

export async function addItem(url: string, options?: Record<string, any>) {
  return request<any>(url, { method: "POST", data: options || {} });
}

export async function updateItem(url: string, options?: Record<string, any>) {
  return request<any>(url, { method: "PUT", data: options || {} });
}

export async function handleItem(url: string, options?: Record<string, any>) {
  return request<any>(url, { method: "PATCH", data: options || {} });
}

export async function removeItem(url: string, options?: Record<string, any>) {
  return request<any>(url, { method: "DELETE", data: options || {} });
}
