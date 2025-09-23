export const GET = "GET" as const;
export const POST = "POST" as const;
export const PATCH = "PATCH" as const;
export const PUT = "PUT" as const;
export const DELETE = "DELETE" as const;

//----------------------
export type HTTPMethod =
  | typeof GET
  | typeof POST
  | typeof PATCH
  | typeof PUT
  | typeof DELETE;
//----------------------

//-----------------------------------------------------------------------
const API_BASE_URL = "http://localhost:5234";

export const API_FILE_RESOURCES_URL = "http://localhost:5234/Resources/";
//-----------------------------------------------------------------------

//=======================================
interface ApiCallParams {
  method: HTTPMethod;
  endpoint: string;
  customHeaders?: Record<string, string>;
  body?: unknown;
}
//=======================================
export async function apiCall({
  method = GET,
  endpoint,
  customHeaders,
  body,
}: ApiCallParams): Promise<any> {
  const token = localStorage.getItem("token");

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

  const headers = {
    ...defaultHeaders,
    ...customHeaders,
  };

  if (body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : null,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError({
      instance: data.instance,
      type: data.type,
      title: data.title,
      status: data.status || response.status,
      detail: data.detail || response.statusText,
      traceId: data.traceId,
    });
  }

  return data;
}

//===========================================================

export interface IApiError {
  instance?: string;
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  traceId?: string;
}
export class ApiError extends Error implements IApiError {
  instance?: string;
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  traceId?: string;

  constructor(error: IApiError) {
    super(error.title || error.detail || "API Error");

    this.name = "ApiError";

    this.instance = error.instance;
    this.type = error.type;
    this.title = error.title;
    this.status = error.status;
    this.detail = error.detail;
    this.traceId = error.traceId;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
