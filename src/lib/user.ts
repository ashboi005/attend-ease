import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  displayName: string;
}

export async function getUserRole(uid: string): Promise<UserProfile['role'] | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      return userData.role;
    } else {
      console.error('No such user document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
}
