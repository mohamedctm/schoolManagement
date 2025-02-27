import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to extract cookies from the request headers
function getCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  return cookieHeader
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

export async function GET(req: Request) {
  // Extract the token from the cookies
  const token = getCookie(req.headers.get('cookie'), 'token');
  console.log('Token from Cookies:', token);

  if (!token) {
    console.error('Token not found in cookies');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate the token structure
  if (token.split('.').length !== 3) {
    console.error('Invalid token structure');
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id:number;username: string,name:string;last_name:string;level:string };
    console.log('Decoded Token:', decoded);
    return NextResponse.json({ id: decoded.id, username: decoded.username,name: decoded.name ,last_name: decoded.last_name,level: decoded.level});
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}