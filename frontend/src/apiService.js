// frontend/src/apiService.js - FIXED VERSION
import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Create axios instance with proper defaults
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  // ================ AUTHENTICATION METHODS ================
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await apiClient.post('/api/login', { email, password });
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      const response = await apiClient.post('/api/register', userData);
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      console.log('🚪 Logging out...');
      const response = await apiClient.post('/api/logout');
      console.log('✅ Logout successful');
      return response.data;
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/profile');
      return response.data;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      // Don't throw on 401 - let AuthContext handle it
      if (error.response?.status === 401) {
        return { authenticated: false };
      }
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      console.log('📝 Updating profile...');
      const response = await apiClient.put('/api/profile', profileData);
      console.log('✅ Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  },

  // ================ RECOMMENDATION METHODS ================
  getRecommendations: async (filters) => {
  try {
    const payload = {
      branch: filters.preferred_branch || filters.branch || '',
      city: filters.preferred_city || filters.city || '',
      state: filters.state || '',
      max_fees: filters.max_fees || 999999999,
      min_rating: filters.min_rating || 0,
      limit: filters.k || 50,
      user_id: filters.user_id || null,
    };

    console.log('🔍 Sending enhanced search request:', payload);
    const response = await apiClient.post('/api/enhanced-search', payload);
    console.log('🔍 Enhanced API response:', response.data);

    const recommendations = response.data.recommendations || [];
    
    // FIXED: Backend sends Capital letter fields like "Rating", "Average Fees", "College Type"
    const colleges = recommendations.map(rec => {
      // Debug first recommendation
      if (recommendations.indexOf(rec) === 0) {
        console.log('🔍 RAW backend data:', rec);
      }
      
      return {
        // College name - backend sends "College Name" with capital letters
        college_name: String(rec['College Name'] || rec.college_name || 'Unknown College'),
        name: String(rec['College Name'] || rec.college_name || 'Unknown College'),
        
        // Location - backend sends "City" with capital C
        location: String(rec.City || rec.city || rec.location || ''),
        city: String(rec.City || rec.city || rec.location || ''),
        state: String(rec.State || rec.state || ''),
        
        // Branch
        branch: String(rec.branch || ''),
        
        // CRITICAL FIX: Backend sends "Rating" (capital R) not "rating"
        rating: parseFloat(rec.Rating || rec.rating || 0),
        
        // CRITICAL FIX: Backend sends "Average Fees" (with space) not "average_fees"
        fees: parseFloat(rec['Average Fees'] || rec.average_fees || rec.fees || 0),
        average_fees: parseFloat(rec['Average Fees'] || rec.average_fees || rec.fees || 0),
        
        // CRITICAL FIX: Backend sends "College Type" (with space) not "college_type"
        type: String(rec['College Type'] || rec.college_type || rec.type || ''),
        college_type: String(rec['College Type'] || rec.college_type || rec.type || ''),
        
        // Backend sends "University" with capital U
        university: String(rec.University || rec.university || ''),
        
        // Backend sends "Facilities" with capital F
        facilities: String(rec.Facilities || rec.facilities || ''),
        
        // CRITICAL FIX: Backend sends "Total Faculty" (with space)
        total_faculty: parseInt(rec['Total Faculty'] || rec.total_faculty || 0),
        faculty_count: parseInt(rec['Total Faculty'] || rec.total_faculty || 0),
        faculty: parseInt(rec['Total Faculty'] || rec.total_faculty || 0),
        
        // CRITICAL FIX: Backend sends "Total Student Enrollments"
        total_students: parseInt(rec['Total Student Enrollments'] || rec.total_students || 0),
        student_count: parseInt(rec['Total Student Enrollments'] || rec.total_students || 0),
        enrollment: parseInt(rec['Total Student Enrollments'] || rec.total_students || 0),
        
        // Additional fields
        campus_size: String(rec['Campus Size'] || rec.campus_size || ''),
        genders_accepted: String(rec['Genders Accepted'] || rec.genders_accepted || ''),
        established_year: parseInt(rec['Established Year'] || rec.established_year || 0),
        establishment_year: parseInt(rec['Established Year'] || rec.established_year || 0),
        
        // ML scores
        ml_score: parseFloat(rec.ml_score || 0),
        score: parseFloat(rec.ml_score || rec.score || 0),
        recommendation_type: rec.recommendation_type || 'standard',
        
        // Wishlist
        is_in_wishlist: rec.in_wishlist || rec.is_in_wishlist || false,
        
        // Branches
        branches: rec.branches || [{ name: rec.branch || '' }],
        
        // ID for wishlist operations
        id: rec['College Name'] || rec.college_name || 'unknown'
      };
    });

    console.log(`🎉 Successfully loaded ${colleges.length} colleges with enhanced data`);
    
    // Debug first mapped college
    if (colleges.length > 0) {
      console.log('📋 First mapped college:', {
        name: colleges[0].college_name,
        rating: colleges[0].rating,
        fees: colleges[0].fees,
        type: colleges[0].type,
        faculty: colleges[0].total_faculty,
        students: colleges[0].total_students
      });
    }
    
    return colleges;

  } catch (error) {
    console.error('❌ Error fetching recommendations:', error);
    return [];
  }
},

  // ================ FILTER DATA METHODS ================
  getAllCollegesForFilters: async () => {
    try {
      console.log('🔍 Fetching ALL cities and branches for filter suggestions...');
      
      const [citiesResponse, branchesResponse] = await Promise.all([
        apiClient.get('/api/all-cities'),
        apiClient.get('/api/all-branches')
      ]);
      
      const allCities = citiesResponse.data.cities || [];
      const allBranches = branchesResponse.data.branches || [];
      
      console.log(`🎯 Got ${allCities.length} cities and ${allBranches.length} branches`);
      
      // Create mock college objects for FilterPanel compatibility
      const mockColleges = [];
      allCities.forEach(city => {
        allBranches.forEach(branch => {
          mockColleges.push({
            college_name: `${city} - ${branch}`,
            name: `${city} - ${branch}`,
            city: city,
            state: 'Maharashtra',
            branch: branch,
            college_type: 'All Types',
            rating: 0,
            average_fees: 0,
            facilities: '',
            branches: [{ name: branch }],
          });
        });
      });
      
      console.log(`🏛️ Created ${mockColleges.length} filter combinations`);
      return mockColleges;

    } catch (error) {
      console.error('❌ Error fetching cities/branches for filters:', error);
      return [];
    }
  },

  // ================ WISHLIST METHODS ================
  getWishlist: async () => {
    try {
      console.log('📋 Fetching user wishlist...');
      const response = await apiClient.get('/api/wishlist');
      console.log(`✅ Wishlist loaded: ${response.data.wishlist.length} items`);
      return response.data.wishlist;
    } catch (error) {
      console.error('❌ Get wishlist error:', error);
      throw error;
    }
  },

  addToWishlist: async (college) => {
    try {
      const wishlistItem = {
        college_name: college.college_name || college.name,
        branch: college.branch,
        city: college.city,
        state: college.state,
        college_type: college.college_type || college.type,
        average_fees: college.average_fees || college.fees,
        rating: college.rating,
        facilities: college.facilities,
        university: college.university,
        notes: college.notes || ''
      };

      console.log('➕ Adding to wishlist:', wishlistItem.college_name, wishlistItem.branch);
      const response = await apiClient.post('/api/wishlist/add', wishlistItem);
      console.log('✅ Added to wishlist successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Add to wishlist error:', error);
      throw error;
    }
  },

  removeFromWishlist: async (itemId) => {
    try {
      console.log('➖ Removing from wishlist, item ID:', itemId);
      const response = await apiClient.delete(`/api/wishlist/remove/${itemId}`);
      console.log('✅ Removed from wishlist successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Remove from wishlist error:', error);
      throw error;
    }
  },

  // ================ RATING METHODS ================
  rateCollege: async (collegeName, rating, review = '') => {
    try {
      console.log('⭐ Submitting rating:', collegeName, rating);
      const response = await apiClient.post('/api/rate-college', {
        college_name: collegeName,
        rating,
        review
      });
      console.log('✅ Rating submitted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Rating error:', error);
      throw error;
    }
  },
};

export default apiService;
