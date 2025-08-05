import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { requireAuth } from '@/lib/auth-utils';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const resumeId = request.url.split('/').pop();
    
    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    const resumeDoc = await getDoc(doc(db, 'resumes', resumeId));
    
    if (!resumeDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }

    const resumeData = resumeDoc.data();
    
    // Check if user owns this resume
    if (resumeData.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resumeDoc.id,
        ...resumeData,
        uploadedAt: resumeData.uploadedAt?.toDate()?.toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error fetching resume:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const resumeId = request.url.split('/').pop();
    
    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    const resumeDoc = await getDoc(doc(db, 'resumes', resumeId));
    
    if (!resumeDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }

    const resumeData = resumeDoc.data();
    
    // Check if user owns this resume
    if (resumeData.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete file from storage
    if (resumeData.storagePath) {
      const storageRef = ref(storage, resumeData.storagePath);
      await deleteObject(storageRef);
    }

    // Delete document from Firestore
    await deleteDoc(doc(db, 'resumes', resumeId));

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully',
    });

  } catch (error: any) {
    console.error('Error deleting resume:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
});

export const PATCH = requireAuth(async (request: NextRequest, user) => {
  try {
    const resumeId = request.url.split('/').pop();
    const body = await request.json();
    
    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    const resumeDoc = await getDoc(doc(db, 'resumes', resumeId));
    
    if (!resumeDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }

    const resumeData = resumeDoc.data();
    
    // Check if user owns this resume
    if (resumeData.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update allowed fields
    const allowedUpdates = ['isActive'];
    const updates: any = {};
    
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await updateDoc(doc(db, 'resumes', resumeId), updates);

    return NextResponse.json({
      success: true,
      message: 'Resume updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating resume:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to update resume' },
      { status: 500 }
    );
  }
});