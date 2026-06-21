// frontend/src/components/Dashboard/Dashboard.js - Enhanced with Authentication & Database Wishlist
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import apiService from '../../apiService';
import FilterPanel from './FilterPanel';
import CollegeCard from './CollegeCard';
import CollegeDetailsModal from './CollegeDetailsModal';

// Safe WishlistTab component with database integration
const WishlistTab = ({ wishlist, onRemove, onViewDetails, loading }) => (
    <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', margin: 0, marginBottom: '1.5rem' }}>
            My Wishlist ({wishlist ? wishlist.length : 0})
        </h2>
        
        {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p style={{ color: '#6b7280' }}>Loading your wishlist...</p>
            </div>
        ) : wishlist && wishlist.length > 0 ? (
            wishlist
                .filter(college => college && college.college_name)
                .map(college => (
                    <CollegeCard
                        key={`${college.college_name}-${college.branch}-${college.id}`}
                        college={college}
                        isInWishlist={true}
                        onRemoveFromWishlist={() => onRemove(college)}
                        onViewDetails={onViewDetails}
                    />
                ))
        ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💝</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                    Your Wishlist is Empty
                </h3>
                <p style={{ color: '#6b7280' }}>Add colleges to your wishlist to see them here.</p>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    // ================ STATE MANAGEMENT ================
    const [colleges, setColleges] = useState([]);
    const [allCollegesForSuggestions, setAllCollegesForSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('colleges');
    const [selectedCollege, setSelectedCollege] = useState(null);
    
    // ✅ NEW: Database wishlist instead of local state
    const [wishlist, setWishlist] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // ================ YOUR EXISTING LOGIC (ENHANCED) ================
    
    // Remove duplicates by college name + branch combination
    const removeDuplicateColleges = (collegesArray) => {
        const uniqueColleges = [];
        const seenCombinations = new Set();
        
        for (const college of collegesArray) {
            if (college && college.college_name) {
                // Create unique key from college name + branch
                const uniqueKey = `${college.college_name}|${college.branch || ''}`;
                
                if (!seenCombinations.has(uniqueKey)) {
                    seenCombinations.add(uniqueKey);
                    uniqueColleges.push(college);
                }
            }
        }
        
        return uniqueColleges;
    };

    // Enhanced data fetching with duplicate removal (YOUR EXISTING LOGIC + USER CONTEXT)
    const fetchRecommendations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // ✅ ENHANCED: Include user preferences
            const apiFilters = {
                user_id: user ? user.id : null,
                city: filters.city || (user?.city || ''),
                branch: filters.branch || (user?.preferred_branch || ''),
                max_fees: filters.max_fees || (user?.max_budget || 999999999),
                min_rating: filters.min_rating || (user?.min_rating_preference || 0),
                limit: 200 // Get more data to account for duplicates
            };
            
            console.log('🔍 Fetching recommendations with user context:', apiFilters);
            
            const data = await apiService.getRecommendations(apiFilters);

            // Validate and filter data (YOUR EXISTING LOGIC)
            const validData = Array.isArray(data) ? data.filter(college => 
                college && college.college_name && college.college_name.trim() !== ''
            ) : [];

            // Apply search filter (YOUR EXISTING LOGIC)
            const searchFilteredData = validData.filter(college =>
                (college.college_name || '').toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Remove duplicates by college name + branch combination (YOUR EXISTING LOGIC)
            const uniqueColleges = removeDuplicateColleges(searchFilteredData);
            
            // Limit final results to 100 unique college+branch combinations
            const finalColleges = uniqueColleges.slice(0, 100);

            console.log(`✅ Processed ${data.length} → ${validData.length} → ${searchFilteredData.length} → ${uniqueColleges.length} → ${finalColleges.length} college+branch combinations`);
            
            setColleges(finalColleges);
            
            // Load filter suggestions if needed (YOUR EXISTING LOGIC)
            if (allCollegesForSuggestions.length === 0) {
                console.log('🔍 Loading colleges for filter suggestions...');
                const filterData = await apiService.getAllCollegesForFilters();
                setAllCollegesForSuggestions(filterData);
            }

        } catch (err) {
            setError('Could not fetch recommendations. The server may be down.');
            console.error('Error loading recommendations:', err);
            setColleges([]);
        } finally {
            setLoading(false);
        }
    }, [user, filters, searchQuery, allCollegesForSuggestions.length]);

    // ✅ NEW: Load user's wishlist from database
    const loadWishlist = useCallback(async () => {
        if (!user) {
            setWishlist([]);
            return;
        }

        setWishlistLoading(true);
        try {
            console.log('📋 Loading user wishlist from database...');
            const wishlistItems = await apiService.getWishlist();
            setWishlist(wishlistItems);
            console.log(`✅ Loaded ${wishlistItems.length} wishlist items`);
        } catch (error) {
            console.error('❌ Error loading wishlist:', error);
            setWishlist([]);
        } finally {
            setWishlistLoading(false);
        }
    }, [user]);

    // ================ EFFECTS ================
    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    useEffect(() => {
        loadWishlist();
    }, [loadWishlist]);

    // ================ EVENT HANDLERS (ENHANCED) ================
    
    // Your existing view details handler
    const handleViewDetails = (college) => {
        if (!college || !college.college_name) {
            console.warn('Cannot view details of invalid college:', college);
            return;
        }
        setSelectedCollege(college);
    };

    // ✅ ENHANCED: Add to database wishlist
    const handleAddToWishlist = async (collegeToAdd) => {
        if (!user) {
            alert('Please log in to add colleges to your wishlist.');
            return;
        }

        if (!collegeToAdd || !collegeToAdd.college_name) {
            console.error('Cannot add invalid college to wishlist');
            return;
        }
        
        // Check if already in wishlist
        const alreadyInWishlist = wishlist.some(c => 
            c && c.college_name === collegeToAdd.college_name && c.branch === collegeToAdd.branch
        );
        
        if (alreadyInWishlist) {
            alert(`${collegeToAdd.college_name} (${collegeToAdd.branch}) is already in your wishlist!`);
            return;
        }
        
        try {
            console.log('➕ Adding to database wishlist:', collegeToAdd.college_name);
            const result = await apiService.addToWishlist(collegeToAdd);
            
            // Add to local state with the returned item (includes database ID)
            setWishlist(prevWishlist => [...prevWishlist, result.item]);
            
            // Update the college's wishlist status in recommendations
            setColleges(prevColleges => 
                prevColleges.map(college =>
                    college.college_name === collegeToAdd.college_name && college.branch === collegeToAdd.branch
                        ? { ...college, is_in_wishlist: true }
                        : college
                )
            );
            
            console.log('✅ College added to wishlist:', collegeToAdd.college_name);
        } catch (error) {
            console.error('❌ Error adding to wishlist:', error);
            alert('Failed to add to wishlist. Please try again.');
        }
    };

    // ✅ ENHANCED: Remove from database wishlist
    const handleRemoveFromWishlist = async (collegeToRemove) => {
        if (!user) {
            alert('Please log in to manage your wishlist.');
            return;
        }

        if (!collegeToRemove || !collegeToRemove.college_name) {
            console.warn('Cannot remove invalid college from wishlist');
            return;
        }
        
        try {
            // Find the wishlist item with database ID
            const wishlistItem = wishlist.find(c => 
                c && c.college_name === collegeToRemove.college_name && c.branch === collegeToRemove.branch
            );

            if (!wishlistItem || !wishlistItem.id) {
                console.error('Wishlist item not found or missing ID');
                return;
            }

            console.log('➖ Removing from database wishlist:', collegeToRemove.college_name);
            await apiService.removeFromWishlist(wishlistItem.id);
            
            // Remove from local state
            setWishlist(prevWishlist => 
                prevWishlist.filter(c => 
                    !(c && c.college_name === collegeToRemove.college_name && c.branch === collegeToRemove.branch)
                )
            );
            
            // Update the college's wishlist status in recommendations
            setColleges(prevColleges => 
                prevColleges.map(college =>
                    college.college_name === collegeToRemove.college_name && college.branch === collegeToRemove.branch
                        ? { ...college, is_in_wishlist: false }
                        : college
                )
            );
            
            console.log('✅ College removed from wishlist:', collegeToRemove.college_name);
        } catch (error) {
            console.error('❌ Error removing from wishlist:', error);
            alert('Failed to remove from wishlist. Please try again.');
        }
    };

    // ✅ ENHANCED: Rate college with database storage
    const handleRateCollege = async (collegeName, rating) => {
        if (!user) {
            alert("Please log in to rate a college.");
            return;
        }
        if (!collegeName) {
            console.warn('Cannot rate college without name');
            return;
        }
        try {
            console.log('⭐ Submitting rating for:', collegeName, rating);
            await apiService.rateCollege(collegeName, rating);
            alert("Rating submitted successfully!");
            
            // Refresh recommendations to get updated data
            fetchRecommendations();
        } catch (err) {
            console.error('❌ Rating submission failed:', err);
            alert("Failed to submit rating. Please try again.");
        }
    };

    // ✅ ENHANCED: Create wishlist lookup set for college+branch combinations
    const wishlistCollegeBranchNames = new Set(
        wishlist
            .filter(item => item && item.college_name)
            .map(item => `${item.college_name}|${item.branch || ''}`)
    );

    // ================ LOADING STATE (YOUR EXISTING LOGIC) ================
    if (loading && colleges.length === 0) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '3rem', height: '3rem', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading Recommendations...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Header (YOUR EXISTING DESIGN + USER INFO) */}
            <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 20 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                            College Finder
                            {user && (
                                <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '1rem' }}>
                                    Welcome, {user.full_name}!
                                </span>
                            )}
                        </h1>
                        
                        {/* Search Bar (YOUR EXISTING DESIGN) */}
                        <div style={{ flex: 1, maxWidth: '32rem', margin: '0 2rem' }}>
                            <input
                                type="text"
                                placeholder="Search colleges by name..."
                                style={{ 
                                    width: '100%', 
                                    padding: '0.5rem 1rem', 
                                    border: '1px solid #d1d5db', 
                                    borderRadius: '8px', 
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Navigation (YOUR EXISTING DESIGN + USER CONTEXT) */}
                        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button 
                                onClick={() => setActiveTab('colleges')} 
                                style={{
                                    ...navButtonStyle, 
                                    ...(activeTab === 'colleges' && activeNavButtonStyle)
                                }}
                            >
                                📚 Colleges
                            </button>
                            <button 
                                onClick={() => setActiveTab('wishlist')} 
                                style={{
                                    ...navButtonStyle, 
                                    ...(activeTab === 'wishlist' && activeNavButtonStyle)
                                }}
                            >
                                💝 Wishlist ({wishlist ? wishlist.length : 0})
                            </button>
                            {user ? (
                                <button onClick={logout} style={logoutButtonStyle}>
                                    Logout
                                </button>
                            ) : (
                                <button onClick={() => navigate('/login')} style={navButtonStyle}>
                                    Login
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content (YOUR EXISTING DESIGN) */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
                    {/* Sidebar (YOUR EXISTING DESIGN) */}
                    <aside>
                        <FilterPanel
                            filters={filters}
                            onFilterChange={setFilters}
                            allColleges={allCollegesForSuggestions}
                        />
                    </aside>

                    {/* Content Area (YOUR EXISTING DESIGN + DATABASE INTEGRATION) */}
                    <section>
                        {activeTab === 'colleges' && (
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', margin: 0, marginBottom: '1.5rem' }}>
                                    Showing {colleges ? colleges.length : 0} College+Branch Combinations
                                    {user && user.preferred_branch && (
                                        <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '1rem' }}>
                                            (Personalized for {user.preferred_branch})
                                        </span>
                                    )}
                                </h2>
                                
                                {error && <p style={{color: 'red', marginBottom: '1rem'}}>{error}</p>}
                                
                                {colleges && colleges.length > 0 ? (
                                    colleges.map((college, index) => (
                                        <CollegeCard
                                            key={`${college.college_name}-${college.branch}-${index}`}
                                            college={college}
                                            onAddToWishlist={handleAddToWishlist}
                                            onRemoveFromWishlist={handleRemoveFromWishlist}
                                            isInWishlist={college.is_in_wishlist || wishlistCollegeBranchNames.has(`${college.college_name}|${college.branch || ''}`)}
                                            onViewDetails={handleViewDetails}
                                            onRate={handleRateCollege}
                                            isLoggedIn={!!user}
                                        />
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>No colleges found</h3>
                                        <p style={{ color: '#6b7280' }}>Try adjusting your search or filters.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'wishlist' && (
                           <WishlistTab 
                             wishlist={wishlist} 
                             onRemove={handleRemoveFromWishlist}
                             onViewDetails={handleViewDetails}
                             loading={wishlistLoading}
                           />
                        )}
                    </section>
                </div>
            </main>

            {/* Modal (YOUR EXISTING DESIGN) */}
            {selectedCollege && (
                <CollegeDetailsModal
                    college={selectedCollege}
                    onClose={() => setSelectedCollege(null)}
                />
            )}
        </div>
    );
};

// Styles (YOUR EXISTING DESIGN)
const navButtonStyle = { 
    padding: '0.5rem 1rem', 
    borderRadius: '6px', 
    border: 'none', 
    fontSize: '0.875rem', 
    fontWeight: '500',
    backgroundColor: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
};

const activeNavButtonStyle = {
    backgroundColor: '#dbeafe',
    color: '#1e40af'
};

const logoutButtonStyle = {
    padding: '0.5rem 1rem', 
    borderRadius: '6px', 
    border: '1px solid #d1d5db', 
    fontSize: '0.875rem', 
    fontWeight: '500',
    backgroundColor: 'white',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
};

export default Dashboard;
