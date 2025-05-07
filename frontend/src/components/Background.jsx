import React from 'react';
import './Background.css';
import calendar from '../assets/calendar.png';
import ticket from '../assets/ticket.png';

const FallingIcons = () => {
  const icons = [
    { left: '5%', animationDuration: '6s', animationDelay: '0s', img: calendar },
    { left: '20%', animationDuration: '5s', animationDelay: '0.5s', img: ticket },
    { left: '35%', animationDuration: '7s', animationDelay: '1s', img: calendar },
    { left: '50%', animationDuration: '4s', animationDelay: '1.5s', img: ticket },
    { left: '65%', animationDuration: '6s', animationDelay: '2s', img: calendar },
    { left: '80%', animationDuration: '5s', animationDelay: '2.5s', img: ticket },
    { left: '95%', animationDuration: '7s', animationDelay: '3s', img: calendar },
  ];

  return (
    <div className="falling-icons">
      {icons.map((icon, index) => (
        <div
          key={index}
          className="flake"
          style={{
            left: icon.left,
            animationDuration: icon.animationDuration,
            animationDelay: icon.animationDelay
          }}
        >
          <img src={icon.img} alt="Falling Icon" className="flake-icon" />
        </div>
      ))}
    </div>
  );
};

const Background = () => {
  return (
    <div className="background">
      <FallingIcons />
    </div>
  );
};

export default Background;
