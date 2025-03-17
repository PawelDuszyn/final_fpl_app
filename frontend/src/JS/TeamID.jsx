import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '@mui/lab/LoadingButton';
import { FormControl, InputLabel, OutlinedInput} from '@mui/material';

function TeamID() {
    const [teamId, setTeamId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = React.useState(false);

    const navigate = useNavigate();    

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleTeamId = async (e) => {
        e.preventDefault();
        setLoading(true);
        const username = localStorage.getItem('username');
        console.log('handleTeamId called');
        try {
                const response = await fetch(`${apiUrl}/insert-teamid`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, teamId}),
                  });
                  if (response.ok) {
                    localStorage.setItem('teamid', teamId);
                    localStorage.setItem('username', username);
                    console.log('Updating teamid successful');
                    navigate('/');
                    
                  } else {
                    setErrorMessage('Failed to save Team ID, please try again');
                }
            }
         catch (error) {
            setErrorMessage('Error saving Team ID');
            
        }
    };

    return (
        <div className='centered-container'>
            <h2>Sign in</h2>
            <form onSubmit={handleTeamId}>
                <div>
                    <FormControl
                        sx={{ m: 1, width: '25ch' }}
                        variant="outlined"
                    >
                        <InputLabel htmlFor="outlined-adornment-password">Team ID</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-username"
                            type='text'
                            value={teamId}
                            onChange={(e) => setTeamId(e.target.value)}
                            label="Team ID"
                            required
                        />
                    </FormControl>
                </div>
                <LoadingButton type="submit" variant="contained" loading={loading}>ENTER</LoadingButton>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default TeamID;