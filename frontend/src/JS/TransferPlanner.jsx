import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Player from './Player'; 

function TransferPlanner({ onLogOut }) {
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [goalkeepers, setGoalkeepers] = useState([]);
    const [defenders, setDefenders] = useState([]);
    const [midfielders, setMidfielders] = useState([]);
    const [forwards, setForwards] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const teamId = localStorage.getItem('teamid');
            if (!token || !teamId) {
                navigate('/');
                return;
            }
            const savedTeamData = localStorage.getItem('teamData');
            if (savedTeamData) {
                const parsedData = JSON.parse(savedTeamData);
                setTeamData(parsedData);
                setLoading(false);
            } else {
                try {
                    const response = await fetch(`${apiUrl}/get-user-team`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ teamId })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.fplData) {
                            setTeamData(data.fplData);
                            localStorage.setItem('teamData', JSON.stringify(data.fplData));
                        } else {
                            setError('No team data received from the server');
                        }
                    } else {
                        setError('Failed to fetch data from server');
                    }
                } catch (error) {
                    setError('Error fetching data from server');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (teamData && Array.isArray(teamData)) {
            setGoalkeepers(teamData.filter(player => player.playerDetails.element_type === 1));
            setDefenders(teamData.filter(player => player.playerDetails.element_type === 2));
            setMidfielders(teamData.filter(player => player.playerDetails.element_type === 3));
            setForwards(teamData.filter(player => player.playerDetails.element_type === 4));
        }
    }, [teamData]);

    const handleUpdatePlayersStats = async ()=> {
        try {
            const response = await fetch(`${apiUrl}/update-players-info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className=''>
            <div className='centered-container'>
                <div className='pitch'>
                    <div className='pitch-line pitch-line-goalkeepers'>
                        {goalkeepers.length > 0 ? goalkeepers.map(player => (
                            <Player key={player.element} player={player} />
                        )) : <div>No goalkeepers</div>}
                    </div>
                    <div className='pitch-line pitch-line-defenders'>
                        {defenders.length > 0 ? defenders.map(player => (
                             <Player key={player.element} player={player} />
                        )) : <div>No defenders</div>}
                    </div>
                    <div className='pitch-line pitch-line-midfielders'>
                        {midfielders.length > 0 ? midfielders.map(player => (
                             <Player key={player.element} player={player} />
                        )) : <div>No midfielders</div>}
                    </div>
                    <div className='pitch-line pitch-line-forwards'>
                        {forwards.length > 0 ? forwards.map(player => (
                             <Player key={player.element} player={player} />
                        )) : <div>No forwards</div>}
                    </div>
                    <div className='bench-line bench-line-bench'>
                        <div className='bench'>Bench</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransferPlanner;
