export class ApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

export function isAccessDeniedError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return err.status === 403 || err.errorCode === 'FORBIDDEN';
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes('permission') || msg.includes('do not have access');
  }
  return false;
}

export function accessDeniedMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  return 'You do not have permission to perform this action.';
}

type ApiErrorBody = {
  message?: string;
  error_code?: string;
  detail?: string | Array<{ msg?: string }>;
};

export function throwApiError(res: Response, body: ApiErrorBody | null): never {
  const detail = body?.detail;
  const message =
    body?.message ||
    (typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => item.msg).filter(Boolean).join(', ')
        : undefined) ||
    'Request failed';

  throw new ApiError(message, res.status, body?.error_code);
}
