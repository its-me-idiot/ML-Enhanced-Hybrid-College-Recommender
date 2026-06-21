// frontend/src/components/Dashboard/CollegeDetailsModal.js
import React, { useState, useEffect } from 'react';
import apiService from '../../apiService'; // Correct path

const CollegeDetailsModal = ({ college, onClose }) => {
  const [cutoffs, setCutoffs] = useState([]);
  const [loadingCutoffs, setLoadingCutoffs] = useState(true);

  useEffect(() => {
    if (college && college.id) {
      setLoadingCutoffs(true);
      apiService.getCollegeCutoffs(college.id)
        .then(data => {
          setCutoffs(data);
        })
        .catch(error => {
          console.error('Error fetching cutoffs:', error);
          setCutoffs([]);
        })
        .finally(() => setLoadingCutoffs(false));
    }
  }, [college]);

  if (!college) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        maxWidth: '800px', 
        width: '100%', 
        maxHeight: '90vh', 
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '0.5rem' }}>
                {college.name}
              </h2>
              <p style={{ color: '#6b7280', margin: 0 }}>📍 {college.city}, {college.state}</p>
            </div>
            <button
              onClick={onClose}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0.5rem'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Basic Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>College Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div><strong>Type:</strong> {college.college_type || 'Not specified'}</div>
              {college.established_year && <div><strong>Established:</strong> {college.established_year}</div>}
              {college.university && <div><strong>University:</strong> {college.university}</div>}
              {college.campus_size && <div><strong>Campus Size:</strong> {college.campus_size}</div>}
              {college.total_students && <div><strong>Total Students:</strong> {college.total_students.toLocaleString()}</div>}
              {college.total_faculty && <div><strong>Total Faculty:</strong> {college.total_faculty.toLocaleString()}</div>}
              {college.average_fees && <div><strong>Average Fees:</strong> ₹{college.average_fees.toLocaleString()}/year</div>}
              {college.rating && <div><strong>Rating:</strong> ⭐ {college.rating}/5</div>}
              <div><strong>Genders Accepted:</strong> {college.genders_accepted || 'Not specified'}</div>
              {!college.is_verified && (
                <div style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ Not Authenticated by Admin</div>
              )}
            </div>
          </div>

          {/* Branches */}
          {college.branches && college.branches.length > 0 ? (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                Available Branches ({college.branches.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                {college.branches.map((branch, index) => (
                  <div key={index} style={{ 
                    padding: '0.5rem', 
                    backgroundColor: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    {branch.name || 'Branch name not specified'}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                Available Branches
              </h3>
              <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Branch information not available for this college.</p>
            </div>
          )}

          {/* Facilities */}
          {college.facilities && college.facilities.length > 0 ? (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                Facilities ({college.facilities.length})
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {college.facilities.map((facility, index) => (
                  <span key={index} style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#dbeafe', 
                    color: '#1e40af', 
                    fontSize: '0.875rem', 
                    borderRadius: '20px' 
                  }}>
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                Facilities
              </h3>
              <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Facility information not available for this college.</p>
            </div>
          )}

          {/* Cutoff Information (New) */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              Cutoff Data ({cutoffs.length})
            </h3>
            {loadingCutoffs ? (
              <p>Loading cutoff data...</p>
            ) : cutoffs.length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: '#f9fafb', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Branch</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Category</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Gender</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Percentile</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Rank</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Score Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cutoffs.map((cutoff, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem' }}>{cutoff.branch || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{cutoff.category || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{cutoff.gender || '-'}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{cutoff.percentile ? `${cutoff.percentile}%` : '-'}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{cutoff.rank || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{cutoff.score_type || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No cutoff information available for this college.</p>
            )}
          </div>

          {/* Note about cutoffs (existing) */}
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '8px', 
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369a1' }}>
              💡 <strong>Note:</strong> Cutoff data might be specific to certain admission rounds or years. Always verify with official college sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDetailsModal;