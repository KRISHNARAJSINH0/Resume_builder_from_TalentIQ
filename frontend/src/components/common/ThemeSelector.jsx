import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette, ChevronDown, Check } from 'lucide-react';

export default function ThemeSelector() {
  const { themeId, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTheme = themes[themeId];

  return (
    <div className="theme-switcher-container" ref={containerRef}>
      <button 
        className="theme-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Change theme"
      >
        <Palette size={15} className="theme-icon" />
        <span className="theme-name-label">
          {activeTheme?.emoji} {activeTheme?.name}
        </span>
        <ChevronDown size={14} className={`theme-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <ul className="theme-dropdown" role="listbox">
          {Object.values(themes).map((t) => {
            const isActive = t.id === themeId;
            return (
              <li 
                key={t.id}
                className={`theme-option ${isActive ? 'active' : ''}`}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
              >
                <span className="theme-option-left">
                  <span className="theme-option-emoji">{t.emoji}</span>
                  <div className="theme-option-info">
                    <span className="theme-option-name">{t.name}</span>
                    <span className="theme-option-desc">{t.description}</span>
                  </div>
                </span>
                
                <span className="theme-option-right">
                  {/* Theme preview colors */}
                  <div className="theme-preview-dots">
                    {t.preview && t.preview.map((color, idx) => (
                      <span 
                        key={idx} 
                        className="theme-dot" 
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {isActive && <Check size={14} className="theme-check-icon" />}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
