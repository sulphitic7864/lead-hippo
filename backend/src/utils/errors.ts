export class HttpError extends Error {
  constructor(public status: number, message: string, public code = 'REQUEST_ERROR', public details?: unknown) {
    super(message);
  }
}

export function assert(condition: unknown, status: number, message: string, code?: string): asserts condition {
  if (!condition) throw new HttpError(status, message, code);
}
