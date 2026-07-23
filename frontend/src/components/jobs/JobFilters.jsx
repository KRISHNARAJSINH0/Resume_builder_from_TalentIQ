import React from 'react';
import { Search } from 'lucide-react';

export default function JobFilters({ filters, onFilterChange }) {
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="card glass" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '1rem', alignItems: 'center' }}>
      {/* Search Input bar */}
      <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--muted)' }} />
        <input
          type="text"
          placeholder="Search jobs, companies, keywords..."
          className="form-input"
          style={{ paddingLeft: '32px' }}
        />
      </div>

      {/* Location Select dropdown */}
      <div style={{ minWidth: '130px' }}>
        <select
          name="location"
          className="form-input"
          value={filters.location}
          onChange={handleSelectChange}
        >
          <option value="">All Locations</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Remote">Remote</option>
          <option value="Hyderabad">Hyderabad</option>
        </select>
      </div>

      {/* Experience Select dropdown */}
      <div style={{ minWidth: '130px' }}>
        <select
          name="experience"
          className="form-input"
          value={filters.experience}
          onChange={handleSelectChange}
        >
          <option value="">All Experience</option>
          <option value="0-2">0-2 years</option>
          <option value="2-4">2-4 years</option>
          <option value="3-5">3-5 years</option>
        </select>
      </div>
    </div>
  );
}
