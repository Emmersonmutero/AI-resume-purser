import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { requireAuth } from '@/lib/auth-utils';
import { extractResumeData } from '@/ai/flows/extract-resume-data';
import { generateResumeSummary } from '@/ai/flows/generate-resume-summary';
import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const uploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().max(MAX_FILE_SIZE, 'File size must be less than 10MB'),
  fileType: z.string().refine(type => ALLOWED_TYPES.includes(type), 'Only PDF and DOCX files are allowed'),
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = uploadSchema.safeParse({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Convert file to buffer and create data URI
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload file to Firebase Storage
    const fileName = `resumes/${user.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: user.uid,
        originalName: file.name,
      },
    });
    
    const downloadURL = await getDownloadURL(storageRef);

    // Process with AI
    const extractedData = await extractResumeData({ resumeDataUri: dataUri });
    const summary = await generateResumeSummary({ 
      resumeData: extractedData,
      jobSeekerRole: 'Software Developer' // This could be dynamic based on user preference
    });

    // Save to Firestore
    const resumeDoc = await addDoc(collection(db, 'resumes'), {
      userId: user.uid,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      downloadURL,
      storagePath: fileName,
      extractedData,
      summary: summary.summary,
      uploadedAt: serverTimestamp(),
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      resumeId: resumeDoc.id,
      extractedData,
      summary: summary.summary,
      downloadURL,
    });

  } catch (error: any) {
    console.error('Resume upload error:', error);
    
    if (error.message?.includes('AI processing')) {
      return NextResponse.json(
        { success: false, error: 'Failed to process resume with AI' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
});