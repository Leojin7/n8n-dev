import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

type AuthHandler = {
  GET: (req: NextRequest) => Promise<Response>;
  POST: (req: NextRequest) => Promise<Response>;
};

const authHandler = toNextJsHandler(auth) as unknown as AuthHandler;

const toNextResponse = async (response: Response): Promise<NextResponse> => {
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });
};

const handler = async (req: NextRequest) => {
  try {
    let response: Response;
    
    switch (req.method) {
      case 'GET':
        response = await authHandler.GET(req);
        return toNextResponse(response);
      case 'POST':
        response = await authHandler.POST(req);
        return toNextResponse(response);
      default:
        return new NextResponse('Method not allowed', { status: 405 });
    }
  } catch (error: unknown) {
    console.error('Auth API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  }
};

export { handler as GET, handler as POST };