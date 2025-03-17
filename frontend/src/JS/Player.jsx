import React, { useEffect, useState } from 'react';
import '../CSS/Player.css'; // Optional for styling
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Player = ({ player }) => {
    const [nextFixture, setNextFixture] = useState(null);
    const [nextOpponentShortName, setNextOpponentShortName] = useState(null); // Użyj tej zmiennej
    const [home, sethome] = useState(null);

    const kitUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.playerDetails.team_code}-110.webp`;

    useEffect(() => {
        const fetchPlayerFixtures = async () => {
            try {
                const response = await fetch(`${apiUrl}/get-player-fixtures`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ playerId: player.element }),  
                });

                if (!response.ok) {
                    console.log('Error: Server returned', response.status);
                    const text = await response.text();
                    return;
                }

                const data = await response.json();
                if (data.nextFixture) {
                    setNextFixture(data.nextFixture);
                }
            } catch (error) {
                console.log('Error fetching player fixtures:', error);
            }
        };

        fetchPlayerFixtures();
    }, [player]);

    useEffect(() => {
        const fetchOpponentShortName = async () => {
            if (nextFixture) { // Sprawdź, czy nextFixture jest dostępne
                const opponentTeamId = nextFixture.is_home ? nextFixture.team_a : nextFixture.team_h;
                sethome(nextFixture.is_home ? " (H)" : " (A)");
                
                try {
                    const response = await fetch(`${apiUrl}/get-opponent-short-name`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ teamId: opponentTeamId }), // Użyj ID drużyny przeciwnika
                    });

                    if (!response.ok) {
                        console.log('Error: Server returned', response.status);
                        const text = await response.text();
                        return;
                    }

                    const data = await response.json();
                    if (data.short_name) {
                        setNextOpponentShortName(data.short_name); // Ustaw nazwę drużyny
                    }
                } catch (error) {
                    console.log('Error fetching opponent short name:', error);
                }
            }
        };

        fetchOpponentShortName();
    }, [nextFixture]); // Ustaw dependencies na nextFixture

    return (
        <div className="player-card">
            <div className="player-kit">
                <img src={kitUrl} alt={`${player.playerDetails.web_name} kit`} />
            </div>
            <div className="player-info">
                <div className="player-name">{player.playerDetails.web_name}</div>
                <div className="player-team">{nextOpponentShortName} {home}</div> {/* Użyj short name przeciwnika */}
            </div>
        </div>
    );
};

export default Player;
