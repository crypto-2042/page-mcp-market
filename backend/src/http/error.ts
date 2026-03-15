export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

function isAppErrorLike(error: unknown): error is { status: number; code: string; message: string } {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as Record<string, unknown>;
  return (
    typeof candidate.status === 'number' &&
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string'
  );
}

export function toErrorResponse(error: unknown, requestId: string): { status: number; body: Record<string, string> } {
  if (error instanceof AppError || isAppErrorLike(error)) {
    return {
      status: error.status,
      body: {
        code: error.code,
        message: error.message,
        requestId,
      },
    };
  }

  return {
    status: 500,
    body: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
      requestId,
    },
  };
}
