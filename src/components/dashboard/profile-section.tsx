import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { User as FirebaseUser } from 'firebase/auth';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export function ProfileSection() {
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
          setIsAdmin(docSnap.data().role === 'admin');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarFile(file);
    const avatarRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);
    await updateDoc(doc(db, 'users', user.uid), { avatar: url });
    setProfile((prev) => ({ ...prev, avatar: url }));
    toast({ title: 'Avatar updated!' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    // Only send allowed fields to Firestore
    const updateData: Record<string, any> = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      displayName: profile.displayName || '',
      role: profile.role || '',
      avatar: profile.avatar || '',
    };
    await updateDoc(doc(db, 'users', user.uid), updateData);
    toast({ title: 'Profile updated!' });
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in.</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="flex items-center gap-4 mb-4">
        <Avatar>
          <AvatarImage src={profile.avatar} />
          <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <input type="file" accept="image/*" onChange={handleAvatarUpload} />
      </div>
      <div className="grid gap-2 mb-4">
        <Input name="firstName" value={profile.firstName || ''} onChange={handleChange} placeholder="First Name" />
        <Input name="lastName" value={profile.lastName || ''} onChange={handleChange} placeholder="Last Name" />
        <Input name="displayName" value={profile.displayName || ''} onChange={handleChange} placeholder="Display Name" />
        <Input name="email" value={profile.email || ''} readOnly placeholder="Email" />
        {isAdmin && (
          <Input name="role" value={profile.role || ''} onChange={handleChange} placeholder="Role" />
        )}
      </div>
      <Button onClick={handleSave}>Save Changes</Button>
      {/* Security, Theme, Preferences, Delete Account sections can be added here */}
    </div>
  );
}
