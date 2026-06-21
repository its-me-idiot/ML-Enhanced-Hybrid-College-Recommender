// frontend/src/components/Profile/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import apiService from '../../apiService';

const UserProfile = () => {
  const { user: authUser, logout, setUser: setAuthUser } = useAuth(); // Get user from context and setter
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    if (authUser) {
      fetchProfile();
      fetchFollowing();
      fetchFollowers();
    }
  }, [authUser]); // Re-fetch if authUser changes

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProfile();
      setProfileData(data);
      setFormData(data); // Initialize form with current profile data
    } catch (err) {
      setError('Failed to load profile.');
      console.error(err);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const data = await apiService.getFollowing();
      setFollowing(data);
    } catch (err) {
      console.error('Failed to load following list:', err);
      setFollowing([]);
    }
  };

  const fetchFollowers = async () => {
    try {
      const data = await apiService.getFollowers();
      setFollowers(data);
    } catch (err) {
      console.error('Failed to load followers list:', err);
      setFollowers([]);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiService.updateProfile({
        ...formData,
        // Ensure numbers are sent as numbers or null, not empty strings
        cet_score: formData.cet_score ? parseFloat(formData.cet_score) : null,
        jee_score: formData.jee_score ? parseFloat(formData.jee_score) : null,
      });
      setEditMode(false);
      await fetchProfile(); // Refresh profile data after update
      // Update the user context with the latest profile data
      const updatedUser = await apiService.getProfile();
      setAuthUser(updatedUser);

    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
      console.error(err);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!profileData) return <p>No profile data available. Please login.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>My Profile</h2>

      {editMode ? (
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Username</label>
            <input type="text" name="username" value={formData.username || ''} onChange={handleFormChange} disabled style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#e9ecef' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleFormChange} disabled style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#e9ecef' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Bio</label>
            <textarea name="bio" value={formData.bio || ''} onChange={handleFormChange} rows="3" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>College Enrolled (Full Name)</label>
            <input type="text" name="college_name" value={formData.college_name || ''} onChange={handleFormChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Branch Enrolled</label>
            <input type="text" name="branch" value={formData.branch || ''} onChange={handleFormChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Location (City)</label>
            <input type="text" name="location" value={formData.location || ''} onChange={handleFormChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Gender</label>
            <select
              name="gender"
              value={formData.gender || ''}
              onChange={handleFormChange}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>CET Score (Percentile)</label>
            <input type="number" step="0.01" name="cet_score" value={formData.cet_score || ''} onChange={handleFormChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>JEE Score (Percentile)</label>
            <input type="number" step="0.01" name="jee_score" value={formData.jee_score || ''} onChange={handleFormChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', borderRadius: '4px', border: 'none', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' }}>Save Changes</button>
            <button type="button" onClick={() => setEditMode(false)} style={{ flex: 1, backgroundColor: '#6b7280', color: 'white', padding: '0.75rem', borderRadius: '4px', border: 'none', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem', fontSize: '0.9rem', color: '#374151' }}>
          <div><strong>Username:</strong> {profileData.username}</div>
          <div><strong>Email:</strong> {profileData.email}</div>
          <div><strong>Bio:</strong> {profileData.bio || 'N/A'}</div>
          <div><strong>College:</strong> {profileData.college_name || 'Not Enrolled'}</div>
          <div><strong>Branch:</strong> {profileData.branch || 'N/A'}</div>
          <div><strong>Location:</strong> {profileData.location || 'N/A'}</div>
          <div><strong>Gender:</strong> {profileData.gender || 'N/A'}</div>
          <div><strong>CET Score:</strong> {profileData.cet_score ? `${profileData.cet_score}%` : 'N/A'}</div>
          <div><strong>JEE Score:</strong> {profileData.jee_score ? `${profileData.jee_score}%` : 'N/A'}</div>
          <div><strong>Following:</strong> {profileData.following_count} <button onClick={fetchFollowing} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}>View</button></div>
          <div><strong>Followers:</strong> {profileData.followers_count} <button onClick={fetchFollowers} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}>View</button></div>
          <button onClick={() => setEditMode(true)} style={{ gridColumn: '1 / -1', marginTop: '1.5rem', backgroundColor: '#22c55e', color: 'white', padding: '0.75rem', borderRadius: '4px', border: 'none', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' }}>Edit Profile</button>
        </div>
      )}

      <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>People I Follow ({following.length})</h3>
        {following.length === 0 ? <p style={{ color: '#6b7280' }}>You are not following anyone yet.</p> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {following.map(f => (
              <div key={f.followed_user.id} style={{ padding: '0.75rem 1rem', backgroundColor: '#eef2ff', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 'bold' }}>{f.followed_user.username}</span> ({f.followed_user.location || 'N/A'})
                <button onClick={async () => {
                    try {
                      await apiService.unfollowUser(f.followed_user.id);
                      fetchFollowing(); // Refresh following list
                      // Update current user's followers/following counts
                      const updatedUser = await apiService.getProfile();
                      setAuthUser(updatedUser);
                    } catch (err) {
                      console.error("Failed to unfollow:", err);
                      alert("Failed to unfollow user.");
                    }
                  }} 
                  style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Unfollow</button>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: '#374151' }}>My Followers ({followers.length})</h3>
        {followers.length === 0 ? <p style={{ color: '#6b7280' }}>No one is following you yet.</p> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {followers.map(f => (
              <div key={f.follower_user.id} style={{ padding: '0.75rem 1rem', backgroundColor: '#eef2ff', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid #c7d2fe' }}>
                <span style={{ fontWeight: 'bold' }}>{f.follower_user.username}</span> ({f.follower_user.location || 'N/A'})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;