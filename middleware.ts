import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  const token = req.headers.get('cookie')?.split('; ').find((c) => c.startsWith('token='));

  if (!token) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

// ✅ Apply middleware to all protected routes
export const config = {
  matcher: ['/dashboard', '/employees', '/students'], // Adjust for your protected routes
};
