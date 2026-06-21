// frontend/src/components/Profile/UserCard.js
import React from 'react';
import apiService from '../../apiService'; // Correct path
import { useAuth } from '../../AuthContext';

const UserCard = ({ user, onFollowStatusChange }) => {
  const { user: currentUser, setUser: setAuthUser } = useAuth(); // Current logged-in user

  const handleFollowToggle = async () => {
    try {
      if (user.is_following) {
        await apiService.unfollowUser(user.id);
      } else {
        await apiService.followUser(user.id);
      }
      onFollowStatusChange(user.id, !user.is_following); // Notify parent for re-render/state update
      // Update current user's followers/following counts in context
      const updatedUser = await apiService.getProfile();
      setAuthUser(updatedUser);
    } catch (error) {
      console.error("Failed to update follow status:", error);
      alert("Failed to update follow status: " + (error.message || "An error occurred."));
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#3b82f6', margin: 0 }}>
          {user.username} {user.id === currentUser.id && "(You)"}
        </h3>
        {user.id !== currentUser.id && ( // Don't show follow button for self
          <button
            onClick={handleFollowToggle}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '6px', 
              border: 'none', 
              backgroundColor: user.is_following ? '#fecaca' : '#dbeafe',
              color: user.is_following ? '#dc2626' : '#1e40af',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {user.is_following ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
        <div>📧 {user.email}</div>
        <div>📍 {user.location || 'N/A'}</div>
        <div>🚻 {user.gender || 'N/A'}</div>
        <div>🎓 College: {user.college_name || 'Not Enrolled'}</div>
        <div>📚 Branch: {user.branch || 'N/A'}</div>
        <div>CET: {user.cet_score ? `${user.cet_score}%` : 'N/A'}</div>
        <div>JEE: {user.jee_score ? `${user.jee_score}%` : 'N/A'}</div>
      </div>
    </div>
  );
};

export default UserCard;