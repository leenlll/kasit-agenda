import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import julogo from '../assets/julogo.png';
import kasitagendalogo from '../assets/kasitagendalogo.png';
import kasitlogo from '../assets/kasitlogo.png';
import aboutus from '../assets/aboutus.png';

const Header = ({ showAboutUs = true, extraRightContent }) => {
  const handleAboutUs = () => {
    window.location.href = '/AboutUs';
  };

  return (
    <header className="lp-header">
      <div className="header-section header-left">
        <a href="https://www.ju.edu.jo" target="_blank" rel="noreferrer" className="logo-link">
          <img src={julogo} alt="JU Logo" className="logo logo-left" />
        </a>
      </div>
      <div className="header-section header-center">
<a href="http://localhost:5173/" className="logo-link" target="_self">
          <img src={kasitagendalogo} alt="KASIT-agenda Logo" className="logo logo-center" />
        </a>
      </div>
      <div className="header-section header-right">
        <a href="https://computer.ju.edu.jo/home.aspx" target="_blank" rel="noreferrer" className="logo-link">
          <img src={kasitlogo} alt="KASIT Logo" className="logo logo-right" />
        </a>
        {showAboutUs && (
          <img src={aboutus} alt="About Us" className="about-photo" onClick={handleAboutUs} />
        )}
        {extraRightContent && extraRightContent}
      </div>
    </header>
  );
};

export default Header;
