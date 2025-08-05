import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requireAuth } from '@/lib/auth-utils';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const resumesQuery = query(
      collection(db, 'resumes'),
      where('userId', '==', user.uid),
      where('isActive', '==', true),
      orderBy('uploadedAt', 'desc')
    );

    const querySnapshot = await getDocs(resumesQuery);
    const resumes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate()?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      resumes,
    });

  } catch (error: any) {
    console.error('Error fetching resumes:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
});