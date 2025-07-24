import { NextResponse } from 'next/server';
import { admin, adminDb } from '@/lib/firebase-admin';
// Removed client SDK import
// import { db } from '@/lib/firebase';
// import { doc, deleteDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Delete user from Firebase Auth (handle if user does not exist)
    try {
      await admin.auth().deleteUser(uid);
    } catch (err: unknown) {
      const errorCode = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
      if (errorCode !== 'auth/user-not-found') {
        throw err;
      }
      // else: user already deleted, continue
    }

    // Delete user document from Firestore using Admin SDK
    await adminDb.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
