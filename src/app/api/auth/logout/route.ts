import { NextRequest, NextResponse } from 'next/server';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    await signOut(auth);
    
    return NextResponse.json({
      success: true,
      message: 'Successfully logged out',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}