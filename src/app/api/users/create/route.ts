import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { db } from '@/lib/firebase'; // We need the client-side db for setting the document
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { email, password, displayName, role } = await request.json();

    if (!email || !password || !displayName || !role) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Add user details to Firestore
    const userDocRef = doc(db, 'users', userRecord.uid);
    await setDoc(userDocRef, {
      email,
      displayName,
      role,
    });

    const newUser = {
      uid: userRecord.uid,
      email,
      displayName,
      role,
    };

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
