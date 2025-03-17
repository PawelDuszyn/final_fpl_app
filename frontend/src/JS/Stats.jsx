import React, {useEffect, useState} from 'react';
import Table from './Table';
import Button from '@mui/material/Button';
import {useNavigate} from 'react-router-dom';

function Stats() {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const handleUpdatePlayersStats = async () => {
        try {
            const response = await fetch(`${apiUrl}/update-players-info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                alert('Dane zostały pobrane i zapisane w bazie danych!');
            } else {
                setError('Błąd podczas pobierania danych');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Button variant='contained' onClick={handleUpdatePlayersStats}>UPDATE PLAYERS STATS</Button>
            <h3x>Player Statistics</h3x>
            <Table/> {/* Table and filters will go here */}
        </div>
    );
}

export default Stats;
