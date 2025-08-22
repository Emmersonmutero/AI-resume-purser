import React from 'react';
import { UserProfile } from '@clerk/clerk-react';

const UserProfilePage = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <UserProfile path="/user-profile" routing="path" />
  </div>
);

export default UserProfilePage;
