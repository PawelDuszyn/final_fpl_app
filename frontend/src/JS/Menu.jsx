import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Menu.css';

const Menu = ({ onLogOut }) => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState(null);

    const menuItems = [
        {
            text: 'My Team',
            subItems: [
                { text: 'Pick Team', path: '/pick-team' },
                { text: 'Current GW', path: '/current-gw' },
                { text: 'Transfer Planner', path: '/transfer-planner' },
                { text: 'History', path: '/history' },
            ],
        },
        {
            text: 'Stats',
            subItems: [
                { text: 'Stats', path: '/stats' },
                { text: 'Player Stats', path: '/player-stats' },
                { text: 'Teams Stats', path: '/teams-stats' },
                { text: 'Predicted Points', path: '/predicted-points' },
            ],
        },
        // Dodaj inne elementy menu tutaj
    ];

    const handleSubMenuToggle = (index) => {
        setOpenSubMenu(openSubMenu === index ? null : index);
    };

    return (
        <div className="menu-container">
            <button className='hamburger' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                ☰
            </button>
            <ul className={`menu-list ${isMobileMenuOpen ? 'open' : ''}`}>
                {menuItems.map((item, index) => (
                    <li
                    className={`menu-item ${openSubMenu === index ? 'open' : ''}`}
                        key={item.text}
                        onClick={() => handleSubMenuToggle(index)}
                    >
                        {item.text}
                        <ul className='submenu-list'>
                            {item.subItems.map((subItem) => (
                                <li className='submenu-item' key={subItem.text} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen) & navigate(subItem.path)}>
                                    {subItem.text}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
                <li className="menu-item log-out" onClick={onLogOut}>
                    Log Out
                </li>
            </ul>
        </div>
    );
};

export default Menu;