// frontend/src/components/Dashboard/FilterPanel.js
import React, { useState, useEffect } from 'react';

const FilterPanel = ({ filters, onFilterChange, onApplyFilters, allColleges }) => {
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showBranchSuggestions, setShowBranchSuggestions] = useState(false);

  // Get unique cities from all available colleges
  const cities = [...new Set(allColleges.filter(c => c.city).map(college => college.city))].sort();
  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes((filters.city || '').toLowerCase())
  );

  // Get unique branches from all available colleges
  const branches = [...new Set(allColleges.flatMap(college => 
    college.branches ? college.branches.map(b => b.name).filter(name => name) : []
  ))].sort();
  const filteredBranches = branches.filter(branch => 
    branch.toLowerCase().includes((filters.branch || '').toLowerCase())
  );

  // Calculate data availability statistics
  const stats = {
    total: allColleges.length,
    withFees: allColleges.filter(c => c.average_fees && c.average_fees > 0).length,
    withRating: allColleges.filter(c => c.rating && c.rating > 0).length,
    withBranches: allColleges.filter(c => c.branches && c.branches.length > 0).length,
    withFacilities: allColleges.filter(c => c.facilities && c.facilities.length > 0).length,
    collegeTypes: [...new Set(allColleges.filter(c => c.college_type).map(c => c.college_type))]
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>Filters</h3>
      
      {/* Data Availability Summary */}
      <div style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1', margin: '0 0 0.5rem 0' }}>
          Database Coverage
        </h4>
        <div style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: '1.4' }}>
          <div>📊 Total Colleges: {stats.total}</div>
          <div>💰 Fees Available: {stats.withFees} ({stats.total > 0 ? Math.round(stats.withFees/stats.total*100) : 0}%)</div>
          <div>⭐ Ratings Available: {stats.withRating} ({stats.total > 0 ? Math.round(stats.withRating/stats.total*100) : 0}%)</div>
          <div>🎓 Branch Info: {stats.withBranches} ({stats.total > 0 ? Math.round(stats.withBranches/stats.total*100) : 0}%)</div>
          <div>🏢 Facility Info: {stats.withFacilities} ({stats.total > 0 ? Math.round(stats.withFacilities/stats.total*100) : 0}%)</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* City Filter with ALL Suggestions */}
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            City <span style={{ color: '#059669', fontSize: '0.75rem' }}>({cities.length} cities available)</span>
          </label>
          <input
            type="text"
            placeholder={`Search from ${cities.length} cities...`}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            value={filters.city || ''}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
            onFocus={() => setShowCitySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
          />
          {showCitySuggestions && filteredCities.length > 0 && (
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0, 
              backgroundColor: 'white', 
              border: '1px solid #d1d5db', 
              borderRadius: '4px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              maxHeight: '300px', // Increased height to show more options
              overflowY: 'auto',
              zIndex: 10
            }}>
              {/* ✅ REMOVED LIMIT - Shows ALL filtered cities */}
              {filteredCities.map((city, index) => (
                <div
                  key={index}
                  style={{ 
                    padding: '0.5rem', 
                    cursor: 'pointer', 
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '0.875rem'
                  }}
                  onMouseDown={() => onFilterChange({ ...filters, city })}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* College Type Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            College Type <span style={{ color: '#059669', fontSize: '0.75rem' }}>({stats.collegeTypes.length} types available)</span>
          </label>
          <select
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            value={filters.college_type || ''}
            onChange={(e) => onFilterChange({ ...filters, college_type: e.target.value })}
          >
            <option value="">All Types</option>
            {stats.collegeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Branch Filter with ALL Suggestions */}
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Branch <span style={{ color: '#059669', fontSize: '0.75rem' }}>({branches.length} branches available)</span>
          </label>
          <input
            type="text"
            placeholder={`Search from ${branches.length} branches...`}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            value={filters.branch || ''}
            onChange={(e) => onFilterChange({ ...filters, branch: e.target.value })}
            onFocus={() => setShowBranchSuggestions(true)}
            onBlur={() => setTimeout(() => setShowBranchSuggestions(false), 200)}
          />
          {showBranchSuggestions && filteredBranches.length > 0 && (
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0, 
              backgroundColor: 'white', 
              border: '1px solid #d1d5db', 
              borderRadius: '4px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              maxHeight: '300px', // Increased height to show more options
              overflowY: 'auto',
              zIndex: 10
            }}>
              {/* ✅ REMOVED LIMIT - Shows ALL filtered branches */}
              {filteredBranches.map((branch, index) => (
                <div
                  key={index}
                  style={{ 
                    padding: '0.5rem', 
                    cursor: 'pointer', 
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '0.875rem'
                  }}
                  onMouseDown={() => onFilterChange({ ...filters, branch })}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {branch}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Max Fees Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Max Fees (₹) <span style={{ color: '#059669', fontSize: '0.75rem' }}>({stats.withFees} colleges have fee data)</span>
          </label>
          <input
            type="number"
            placeholder="e.g., 500000"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            value={filters.max_fees || ''}
            onChange={(e) => onFilterChange({ ...filters, max_fees: e.target.value })}
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Note: Colleges without fee data will still be shown
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Minimum Rating <span style={{ color: '#059669', fontSize: '0.75rem' }}>({stats.withRating} colleges have ratings)</span>
          </label>
          <select
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
            value={filters.min_rating || ''}
            onChange={(e) => onFilterChange({ ...filters, min_rating: e.target.value })}
          >
            <option value="">Any Rating</option>
            <option value="1">1+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Note: Colleges without ratings will still be shown
          </div>
        </div>

        {/* Min/Max Percentile Filters for Cutoff */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Min Cutoff Percentile (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g., 85.00"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
            value={filters.min_percentile || ''}
            onChange={(e) => onFilterChange({ ...filters, min_percentile: e.target.value })}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Max Cutoff Percentile (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g., 99.00"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
            value={filters.max_percentile || ''}
            onChange={(e) => onFilterChange({ ...filters, max_percentile: e.target.value })}
          />
        </div>

        <button
          onClick={onApplyFilters}
          style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem', borderRadius: '4px', border: 'none', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' }}
        >
          Apply Filters
        </button>

        {/* Clear Filters Button */}
        <button
          onClick={() => onFilterChange({})} // Passing empty object to clear all filters
          style={{ width: '100%', backgroundColor: '#6b7280', color: 'white', padding: '0.5rem', borderRadius: '4px', border: 'none', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}
        >
          Clear All Filters
        </button>

        {/* Filter Info */}
        <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
          <strong>Filter Policy:</strong> All colleges are shown by default. Filters only apply to colleges that have the relevant data. 
          Colleges without specific data (fees, ratings, etc.) remain visible to give you complete information.
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
