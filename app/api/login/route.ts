import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import bcrypt from 'bcrypt'; // Ensure bcrypt is installed

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // ✅ Fetch user from Supabase employees table
    const { data: user, error } = await supabase
      .from('employees')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // ✅ Secure Password Check using bcrypt.compare
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // ✅ Generate JWT Token
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, last_name: user.last_name }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // ✅ Set HttpOnly Cookie securely
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'production', // Secure in production
      sameSite: 'strict',
      path: '/',
      maxAge: 3600, // 1 hour
    });

    const response = NextResponse.json({ message: 'Login successful' });
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (_error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}