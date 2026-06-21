// frontend/src/components/Admin/AdminPanel.js
import React, { useState, useEffect } from 'react';
import apiService from '../../apiService';
import { useAuth } from '../../AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [pendingColleges, setPendingColleges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.is_admin) {
      fetchData();
    }
  }, [user, activeTab]); // Re-fetch data when tab changes

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        const usersData = await apiService.getAllUsers();
        setAllUsers(usersData);
      } else if (activeTab === 'pendingColleges') {
        const collegesData = await apiService.getPendingCollegesAdmin();
        setPendingColleges(collegesData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCollege = async (collegeId) => {
    if (window.confirm('Are you sure you want to verify this college? It will become visible to all users.')) {
      try {
        await apiService.verifyCollegeAdmin(collegeId);
        fetchData(); // Refresh list
      } catch (err) {
        alert('Failed to verify college: ' + (err.message || 'An error occurred.'));
        console.error(err);
      }
    }
  };

  const handleDeleteCollege = async (collegeId) => {
    if (window.confirm('Are you sure you want to delete this college? This action cannot be undone.')) {
      try {
        await apiService.deleteCollegeAdmin(collegeId);
        fetchData(); // Refresh list
      } catch (err) {
        alert('Failed to delete college: ' + (err.message || 'An error occurred.'));
        console.error(err);
      }
    }
  };


  if (!user || !user.is_admin) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>Access Denied: You must be an administrator to view this page.</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>Admin Panel</h2>

      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: activeTab === 'users' ? '#dbeafe' : 'transparent',
            color: activeTab === 'users' ? '#1e40af' : '#6b7280',
            fontWeight: '600',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottom: activeTab === 'users' ? '2px solid #3b82f6' : 'none'
          }}
        >
          Manage Users ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('pendingColleges')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: activeTab === 'pendingColleges' ? '#dbeafe' : 'transparent',
            color: activeTab === 'pendingColleges' ? '#1e40af' : '#6b7280',
            fontWeight: '600',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottom: activeTab === 'pendingColleges' ? '2px solid #3b82f6' : 'none',
            marginLeft: '0.5rem'
          }}
        >
          Pending Colleges ({pendingColleges.length})
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Loading data...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && !error && activeTab === 'users' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>All Users</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Username</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>College/Branch</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Location</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Scores</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Followers/Following</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Admin</th>
                  {/* <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem' }}>{u.id}</td>
                    <td style={{ padding: '0.75rem' }}>{u.username}</td>
                    <td style={{ padding: '0.75rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>{u.college_name || 'N/A'} {u.branch && `(${u.branch})`}</td>
                    <td style={{ padding: '0.75rem' }}>{u.location || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>CET: {u.cet_score || 'N/A'}, JEE: {u.jee_score || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>Fls: {u.followers_count}, Flg: {u.following_count}</td>
                    <td style={{ padding: '0.75rem' }}>{u.is_admin ? 'Yes' : 'No'}</td>
                    {/* <td><button>Edit</button> <button>Delete</button></td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && activeTab === 'pendingColleges' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Pending College Authentications ({pendingColleges.length})</h3>
          {pendingColleges.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>No colleges currently pending authentication.</p>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {pendingColleges.map(college => (
                <div key={college.id} style={{ backgroundColor: '#fffbe6', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#92400e', margin: 0 }}>{college.name}</h4>
                    <div>
                      <button 
                        onClick={() => handleVerifyCollege(college.id)}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                      >
                        Verify
                      </button>
                      <button 
                        onClick={() => handleDeleteCollege(college.id)}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#a16207', marginBottom: '0.75rem' }}>
                    Submitted by: <strong>{college.added_by}</strong> (ID: {college.added_by_user_id}) on {new Date(college.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.8rem', color: '#a16207' }}>
                    <div><strong>City:</strong> {college.city}</div>
                    <div><strong>Type:</strong> {college.college_type}</div>
                    <div><strong>Fees:</strong> {college.average_fees ? `₹${college.average_fees.toLocaleString()}` : 'N/A'}</div>
                    <div><strong>Rating:</strong> {college.rating || 'N/A'}</div>
                    <div><strong>University:</strong> {college.university || 'N/A'}</div>
                    <div><strong>Campus:</strong> {college.campus_size || 'N/A'}</div>
                  </div>
                  {college.branches && college.branches.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <strong>Branches:</strong> {college.branches.map(b => b.name).join(', ') || 'N/A'}
                    </div>
                  )}
                  {college.facilities && college.facilities.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <strong>Facilities:</strong> {college.facilities.join(', ') || 'N/A'}
                    </div>
                  )}
                   {college.cutoffs && college.cutoffs.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <strong>Cutoffs (Sample):</strong>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyleType: 'disc' }}>
                        {college.cutoffs.slice(0, 3).map((cutoff, idx) => (
                          <li key={idx}>Branch: {cutoff.branch}, Perc: {cutoff.percentile}% ({cutoff.score_type})</li>
                        ))}
                         {college.cutoffs.length > 3 && <li>...and {college.cutoffs.length - 3} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;