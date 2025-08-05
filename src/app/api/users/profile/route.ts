import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { requireAuth } from '@/lib/auth-utils';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
  githubUrl: z.string().url('Invalid GitHub URL').optional(),
  preferences: z.object({
    jobAlerts: z.boolean().optional(),
    profileVisibility: z.enum(['public', 'private']).optional(),
    desiredJobType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
    desiredSalaryRange: z.object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    }).optional(),
  }).optional(),
});

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      profile: {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        phoneNumber: userData.phoneNumber || null,
        location: userData.location || null,
        bio: userData.bio || null,
        website: userData.website || null,
        linkedinUrl: userData.linkedinUrl || null,
        githubUrl: userData.githubUrl || null,
        photoURL: userData.photoURL || null,
        preferences: userData.preferences || {},
        createdAt: userData.createdAt?.toDate()?.toISOString(),
        updatedAt: userData.updatedAt?.toDate()?.toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
});

export const PATCH = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const updateData = updateProfileSchema.parse(body);

    // Validate salary range if provided
    if (updateData.preferences?.desiredSalaryRange) {
      const { min, max } = updateData.preferences.desiredSalaryRange;
      if (min && max && min > max) {
        return NextResponse.json(
          { success: false, error: 'Minimum salary cannot be greater than maximum salary' },
          { status: 400 }
        );
      }
    }

    const updates: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Update Firebase Auth profile if displayName is being updated
    if (updateData.displayName) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: updateData.displayName,
        });
      }
    }

    // Update Firestore document
    await updateDoc(doc(db, 'users', user.uid), updates);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
});