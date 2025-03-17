import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Welcome from './JS/Welcome';
import TeamID from './JS/TeamID';
import Stats from './JS/Stats';
import Menu from './JS/Menu';
import TransferPlanner from './JS/TransferPlanner';
import './CSS/App.css'; // Jeśli przeniosłeś plik CSS do folderu CSS
import PickTeam from './JS/PickTeam';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogOut = () => {
        ['teamid', 'username', 'token', 'teamData'].forEach(
            item => localStorage.removeItem(item)
        );
        setIsLoggedIn(false);
    };

    const [menuOpen, setMenuOpen] = useState(false);

    const handleMenuToggle = (open) => {
        setMenuOpen(open);
        if (open) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
    };

    return (
        <Router>
            <div>
                {isLoggedIn && <Menu onLogOut={handleLogOut} onMenuToggle={handleMenuToggle}/>}
                <Routes>
                    <Route
                        path='/'
                        element={!isLoggedIn
                            ? <Welcome onLogin={handleLogin}/>
                            : <Navigate to="/pick-team"/>
                        }
                    />
                    <Route
                        path='/team-id'
                        element={isLoggedIn
                            ? <TeamID/>
                            : <Navigate to="/"/>
                        }
                    />
                    <Route
                        path='/pick-team'
                        element={isLoggedIn
                            ? <PickTeam/>
                            : <Navigate to="/"/>
                        }
                    />
                    <Route
                        path='/stats'
                        element={isLoggedIn
                            ? <Stats/>
                            : <Navigate to="/"/>
                        }
                    />
                    <Route
                        path='/transfer-planner'
                        element={isLoggedIn
                            ? <TransferPlanner/>
                            : <Navigate to="/"/>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
