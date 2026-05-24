import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const mainNav = [
  { icon: '🏠', label: 'Dashboard',   path: '/dashboard' },
  { icon: '🎬', label: 'Create Video', path: '/generator' },
  { icon: '📁', label: 'My Videos',    path: '/dashboard/videos' },
  { icon: '🖼️', label: 'Templates',    path: '/templates' },
  { icon: '📊', label: 'Analytics',    path: '/analytics' },
];

const toolsNav = [
  { icon: '✍️', label: 'Script Writer',   path: '/generator/script' },
  { icon: '🎙️', label: 'Voiceover',       path: '/generator/voice' },
  { icon: '📝', label: 'Subtitles',       path: '/generator/subtitles' },
  { icon: '🔍', label: 'SEO Generator',   path: '/generator/seo' },
  { icon: '🛡️', label: 'Copyright Check', path: '/generator/copyright' },
  { icon: '🚀', label: 'Publish',         path: '/publish' },
];

const bottomNav = [
  { icon: '⚙️', label: 'Settings',    path: '/settings' },
  { icon: '💬', label: 'Help Center', path: '/help' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => navigate('/login');

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/dashboard')} role="button" id="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        {!collapsed && (
          <span className="sidebar-logo-text">
            VisionForge<span className="logo-ai-small"> AI</span>
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        className="collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        id="sidebar-collapse-btn"
        aria-label="Toggle sidebar"
      >
        {collapsed ? '›' : '‹'}
      </button>

      {/* Credits pill */}
      {!collapsed && (
        <div className="credits-pill">
          <div className="credits-icon">⚡</div>
          <div className="credits-info">
            <span className="credits-num">47 / 100</span>
            <span className="credits-label">AI Credits</span>
          </div>
          <div className="credits-bar">
            <div className="credits-fill" style={{ width: '47%' }} />
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-label">MAIN</div>}
        {mainNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && <div className="nav-section-label" style={{ marginTop: '16px' }}>TOOLS</div>}
        {collapsed && <div className="nav-divider" />}
        {toolsNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="sidebar-bottom">
        {!collapsed && <div className="nav-divider" />}
        {bottomNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}

        {/* User profile */}
        <div className="sidebar-user">
          <div className="user-avatar">JC</div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">John Creator</div>
              <div className="user-plan">Pro Plan</div>
            </div>
          )}
          {!collapsed && (
            <button className="logout-btn" onClick={handleLogout} id="logout-btn" title="Sign out">
              ⎋
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
