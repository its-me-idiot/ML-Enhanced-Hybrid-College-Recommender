// frontend/src/components/Dashboard/CollegeCard.js
import React, { useState } from 'react';

const CollegeCard = ({ 
    college, 
    onAddToWishlist, 
    onRemoveFromWishlist, 
    isInWishlist, 
    onViewDetails, 
    onRate, 
    isLoggedIn 
}) => {
    const [showAllFacilities, setShowAllFacilities] = useState(false);
    const [showBranches, setShowBranches] = useState(false);
    const [userRating, setUserRating] = useState(0);

    // Safety check - return null if college data is invalid
    if (!college || !college.college_name) {
        console.warn('CollegeCard received invalid college data:', college);
        return null;
    }

    // Safe processing of facilities list
    const facilitiesList = college.facilities && typeof college.facilities === 'string' 
        ? college.facilities.split(',').map(item => item.trim()).filter(item => item) 
        : Array.isArray(college.facilities) ? college.facilities : [];

    // Safe processing of branches list  
    const branchesList = college.branches && typeof college.branches === 'string'
        ? college.branches.split(',').map(item => item.trim()).filter(item => item)
        : Array.isArray(college.branches) ? college.branches
        : college.branch ? [college.branch] : [];

    // Helper function to display data or fallback
    const displayValue = (value, fallback = "Not specified", prefix = "") => {
        if (value !== null && value !== undefined && value !== "" && 
            (typeof value !== 'number' || value !== 0)) {
            return `${prefix}${value}`;
        }
        return fallback;
    };

    // Safe event handlers
    const handleAddToWishlist = () => {
        console.log('CollegeCard - Adding college to wishlist:', college);
        if (onAddToWishlist && college) {
            onAddToWishlist(college);
        }
    };

    const handleRemoveFromWishlist = () => {
        console.log('CollegeCard - Removing college from wishlist:', college);
        if (onRemoveFromWishlist && college) {
            onRemoveFromWishlist(college);
        }
    };

    const handleViewDetails = () => {
        console.log('CollegeCard - Viewing college details:', college);
        if (onViewDetails && college) {
            // Create a processed college object with arrays for modal
            const processedCollege = {
                ...college,
                facilities: facilitiesList, // Convert to array for modal
                branches: branchesList,     // Convert to array for modal
                // Use college_name as name for backward compatibility
                name: college.college_name,
                // Ensure all expected fields exist
                fees: college.average_fees || college.fees || 0,
                id: college.id || college.college_name
            };
            onViewDetails(processedCollege);
        }
    };

    const handleRateCollege = (rating) => {
        setUserRating(rating);
        if (onRate && college.college_name) {
            onRate(college.college_name, rating);
        }
    };

    return (
        <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
            padding: '1.5rem', 
            marginBottom: '1rem',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ marginBottom: '1rem' }}>
                {/* Header with clickable title and wishlist button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3
                        style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '600', 
                            color: '#3b82f6', 
                            margin: 0, 
                            cursor: 'pointer', 
                            textDecoration: 'underline',
                            flex: 1,
                            marginRight: '1rem'
                        }}
                        onClick={handleViewDetails}
                    >
                        {college.college_name}
                    </h3>
                    
                    {/* Heart icon for quick wishlist toggle */}
                    {isInWishlist ? (
                        <button
                            onClick={handleRemoveFromWishlist}
                            title="Remove from wishlist"
                            style={{
                                padding: '0.5rem',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: '#fecaca',
                                color: '#dc2626',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            ❤️
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToWishlist}
                            title="Add to wishlist"
                            style={{
                                padding: '0.5rem',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            🤍
                        </button>
                    )}
                </div>

                {/* College Information Grid */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem', 
                    fontSize: '0.875rem', 
                    color: '#6b7280',
                    marginBottom: '1rem'
                }}>
                    <div>📍 {displayValue(`${college.city}, ${college.state}`, "Location not specified")}</div>
                    <div>🏫 {displayValue(college.college_type, "Type not specified")}</div>
                    <div>💰 {displayValue(college.average_fees || college.fees, "Fees not specified", "₹")}{(college.average_fees || college.fees) ? "/year" : ""}</div>
                    <div>⭐ {displayValue(college.rating, "Rating not available", "")}{college.rating ? "/5" : ""}</div>
                    <div>📅 {displayValue(college.established_year, "Establishment year not specified", "Est. ")}</div>
                    <div>👥 {displayValue(college.total_students, "Student count not available", "")}{college.total_students ? " students" : ""}</div>
                    <div>👨‍🏫 {displayValue(college.total_faculty, "Faculty count not available", "")}{college.total_faculty ? " faculty" : ""}</div>
                    <div>📏 {displayValue(college.campus_size, "Campus size not specified")}</div>
                    <div>🚻 {displayValue(college.genders_accepted, "Gender policy not specified")}</div>
                    {college.university && (
                        <div>🎓 <strong>University:</strong> {college.university}</div>
                    )}
                </div>

                {/* Branches Section */}
                {branchesList.length > 0 ? (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', margin: 0 }}>
                                Branche:
                            </p>
                            {branchesList.length > 3 && (
                                <button 
                                    onClick={() => setShowBranches(!showBranches)} 
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#3b82f6', 
                                        cursor: 'pointer', 
                                        fontSize: '0.75rem', 
                                        textDecoration: 'underline' 
                                    }}
                                >
                                    {showBranches ? 'Show Less' : `View All (${branchesList.length})`}
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {(showBranches ? branchesList : branchesList.slice(0, 3)).map((branch, index) => (
                                <span key={index} style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    backgroundColor: '#ecfdf5', 
                                    color: '#065f46', 
                                    fontSize: '0.75rem', 
                                    borderRadius: '12px' 
                                }}>
                                    {typeof branch === 'string' ? branch : (branch.name || 'Branch not specified')}
                                </span>
                            ))}
                            {!showBranches && branchesList.length > 3 && (
                                <span 
                                    style={{ 
                                        padding: '0.25rem 0.5rem', 
                                        backgroundColor: '#f3f4f6', 
                                        color: '#6b7280', 
                                        fontSize: '0.75rem', 
                                        borderRadius: '12px', 
                                        cursor: 'pointer' 
                                    }} 
                                    onClick={() => setShowBranches(true)}
                                >
                                    +{branchesList.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>
                            Branch information not available
                        </p>
                    </div>
                )}

                {/* Facilities Section */}
                {facilitiesList.length > 0 ? (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', margin: 0 }}>
                                Facilities:
                            </p>
                            {facilitiesList.length > 3 && (
                                <button
                                    onClick={() => setShowAllFacilities(!showAllFacilities)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#3b82f6', 
                                        cursor: 'pointer', 
                                        fontSize: '0.75rem', 
                                        textDecoration: 'underline' 
                                    }}
                                >
                                    {showAllFacilities ? 'Show Less' : `View All (${facilitiesList.length})`}
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {(showAllFacilities ? facilitiesList : facilitiesList.slice(0, 3)).map((facility, index) => (
                                <span key={index} style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    backgroundColor: '#dbeafe', 
                                    color: '#1e40af', 
                                    fontSize: '0.75rem', 
                                    borderRadius: '12px' 
                                }}>
                                    {facility}
                                </span>
                            ))}
                            {!showAllFacilities && facilitiesList.length > 3 && (
                                <span
                                    style={{ 
                                        padding: '0.25rem 0.5rem', 
                                        backgroundColor: '#f3f4f6', 
                                        color: '#6b7280', 
                                        fontSize: '0.75rem', 
                                        borderRadius: '12px', 
                                        cursor: 'pointer' 
                                    }}
                                    onClick={() => setShowAllFacilities(true)}
                                >
                                    +{facilitiesList.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>
                            Facility information not available
                        </p>
                    </div>
                )}

                {/* Rating Section */}
                {isLoggedIn && onRate && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.875rem', color: '#374151', marginRight: '0.5rem' }}>
                            Rate this college:
                        </span>
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => handleRateCollege(star)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.25rem',
                                    cursor: 'pointer',
                                    color: star <= userRating ? '#fbbf24' : '#d1d5db',
                                    padding: '0 0.125rem'
                                }}
                            >
                                ⭐
                            </button>
                        ))}
                    </div>
                )}

                {/* Data Completeness Indicator */}
                <div style={{ 
                    marginBottom: '1rem', 
                    padding: '0.5rem', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '4px', 
                    border: '1px solid #e5e7eb' 
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        <strong>Data Availability:</strong>
                        {(college.average_fees || college.fees) && (
                            <span style={{ color: '#059669', marginLeft: '0.5rem' }}>✓ Fees</span>
                        )}
                        {college.rating > 0 && (
                            <span style={{ color: '#059669', marginLeft: '0.5rem' }}>✓ Rating</span>
                        )}
                        {branchesList.length > 0 && (
                            <span style={{ color: '#059669', marginLeft: '0.5rem' }}>✓ Branches</span>
                        )}
                        {facilitiesList.length > 0 && (
                            <span style={{ color: '#059669', marginLeft: '0.5rem' }}>✓ Facilities</span>
                        )}
                        {college.total_students > 0 && (
                            <span style={{ color: '#059669', marginLeft: '0.5rem' }}>✓ Student Count</span>
                        )}
                    </div>
                </div>

                {/* Verification Status */}
                {!college.is_verified && (
                    <div style={{ 
                        marginBottom: '1rem', 
                        padding: '0.5rem', 
                        backgroundColor: '#fef2f2', 
                        border: '1px solid #fecaca', 
                        borderRadius: '4px' 
                    }}>
                        <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.875rem' }}>
                            ⚠️ Not Authenticated by Admin
                        </span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* Wishlist Button */}
                {isInWishlist ? (
                    <button 
                        onClick={handleRemoveFromWishlist}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        ❤️ Remove from Wishlist
                    </button>
                ) : (
                    <button 
                        onClick={handleAddToWishlist}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        🤍 Add to Wishlist
                    </button>
                )}

                
            </div>
        </div>
    );
};

export default CollegeCard;
