import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import ProjectCard from './ProjectCard';
import '../styles/HomePage.css';

const HomePage = ({ projects, getDisplayName, onSelectProject, onDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const cities = [
    { abbreviation: 'DAL', name: 'Dallas' },
    { abbreviation: 'AUS', name: 'Austin' },
    { abbreviation: 'HOU', name: 'Houston' },
    { abbreviation: 'SA', name: 'San Antonio' },
    { abbreviation: 'CC', name: 'Corpus Christi' }
  ];

  const projectTypes = [
    { abbreviation: 'ES', name: 'Elementary School' },
    { abbreviation: 'MS', name: 'Middle School' },
    { abbreviation: 'HS', name: 'High School' },
    { abbreviation: 'HE', name: 'Higher Education' },
    { abbreviation: 'BP', name: 'Bond Proposal' },
    { abbreviation: 'UQ', name: 'Unique' }
  ];

  // Filter projects based on search term, selected cities, and project types
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search filter
      const displayName = getDisplayName(project.name);
      const searchMatch = searchTerm === '' ||
        displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Parse project name format: CITY-TYPE-name
      const parts = project.name.split('-');
      if (parts.length < 2) return true; // Show projects that don't follow the format

      const projectCity = parts[0];
      const projectType = parts[1];

      const cityMatch = selectedCities.length === 0 || selectedCities.includes(projectCity);
      const typeMatch = selectedProjectTypes.length === 0 || selectedProjectTypes.includes(projectType);

      return cityMatch && typeMatch;
    });
  }, [projects, selectedCities, selectedProjectTypes, searchTerm, getDisplayName]);

  const handleToggleCity = (cityAbbr) => {
    setSelectedCities(prev =>
      prev.includes(cityAbbr)
        ? prev.filter(c => c !== cityAbbr)
        : [...prev, cityAbbr]
    );
  };

  const handleToggleProjectType = (typeAbbr) => {
    setSelectedProjectTypes(prev =>
      prev.includes(typeAbbr)
        ? prev.filter(t => t !== typeAbbr)
        : [...prev, typeAbbr]
    );
  };

  const handleClearFilters = () => {
    setSelectedCities([]);
    setSelectedProjectTypes([]);
    setSearchTerm('');
  };

  const hasActiveFilters = selectedCities.length > 0 || selectedProjectTypes.length > 0 || searchTerm !== '';
  const activeFilterCount = selectedCities.length + selectedProjectTypes.length;

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">Vizzy</h1>

        {/* Search Bar */}
        <div className="home-search">
          <div className="home-search-wrapper">
            <Search size={20} className="home-search-icon" />
            <input
              type="text"
              className="home-search-input"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="home-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="home-filters">
          <div className="home-filters-header">
            <motion.div
              className="home-filters-toggle"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="home-filters-toggle-left">
                <Filter size={16} />
                <span>Filters</span>
                <AnimatePresence>
                  {activeFilterCount > 0 && (
                    <motion.span
                      className="home-filters-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeFilterCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <motion.div
                animate={{ rotate: filtersExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </motion.div>
            <motion.button
              className={`home-filters-clear ${hasActiveFilters ? 'visible' : ''}`}
              onClick={handleClearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={14} />
              Clear all
            </motion.button>
          </div>

          <AnimatePresence>
            {filtersExpanded && (
              <motion.div
                className="home-filters-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="home-filter-section">
                  <div className="home-filter-bubbles">
                    {cities.map((city, index) => (
                      <motion.button
                        key={city.abbreviation}
                        className={`home-filter-bubble ${selectedCities.includes(city.abbreviation) ? 'active' : ''}`}
                        onClick={() => handleToggleCity(city.abbreviation)}
                        title={city.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {city.abbreviation}
                      </motion.button>
                    ))}
                    <span className="home-filter-divider" />
                    {projectTypes.map((type, index) => (
                      <motion.button
                        key={type.abbreviation}
                        className={`home-filter-bubble ${selectedProjectTypes.includes(type.abbreviation) ? 'active' : ''}`}
                        onClick={() => handleToggleProjectType(type.abbreviation)}
                        title={type.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: (cities.length + index) * 0.03 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {type.abbreviation}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Project Grid */}
      <div className="home-projects">
        {filteredProjects.length > 0 ? (
          <div className="home-projects-grid">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                displayName={getDisplayName(project.name)}
                onClick={() => onSelectProject(project.id)}
                onDelete={() => onDeleteProject(project.id)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="home-no-projects">
            <p>No projects found</p>
            {hasActiveFilters && (
              <button className="home-clear-filters-btn" onClick={handleClearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
