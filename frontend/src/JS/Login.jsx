import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '@mui/lab/LoadingButton';
import { FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';


function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleMouseDownPassword = (event) => event.preventDefault();

    const navigate = useNavigate();    

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('handleLogin called');
        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password}),
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Data:', data);
                localStorage.setItem('token', data.token);
                localStorage.setItem('teamid', data.teamid);
                localStorage.setItem('username', username);
                setErrorMessage('');
                console.log('Login successful');
                onLogin();
                try {
                    const updateResponse = await fetch (`${apiUrl}/update-teams-info` , {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'
                        },
                    });
                    if (updateResponse.ok) {
                        console.log("Teams updated successfully");
                    } else {
                        console.error('Failed to update teams:', updateResponse.status);
                    }
                } catch (error) {
                    console.error('Error updating teams:', error);
                    setErrorMessage('Error updating teams');
                }
                if (!data.teamid){
                    navigate('/team-id');
                } else {
                    navigate('/my-team');
                }
            } else {
                const errorData = await response.text();
                console.log('Error data:', errorData);
                setErrorMessage(errorData);
            }
        } catch (error) {
            console.log('Catch error:', error);
            setErrorMessage('Error logging in');
        } finally {
            setLoading(false)
        }
    };

    return (
        <div>
            <h2>Sign in</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <FormControl
                        sx={{ m: 1, width: '25ch' }}
                        variant="outlined"
                    >
                        <InputLabel htmlFor="login-username">Userrrrrrname</InputLabel>
                        <OutlinedInput
                            id="login-username"
                            type='text'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            label="Username"
                            required
                        />
                    </FormControl>
                </div>
                <div>
                    <FormControl
                        sx={{ m: 1, width: '25ch' }}
                        variant="outlined"
                    >
                        <InputLabel htmlFor="login-password">Password</InputLabel>
                        <OutlinedInput
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            endAdornment={<InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>}
                            label="Password"
                            required
                        />
                    </FormControl>
                </div>
                <LoadingButton type="submit" variant="contained" loading={loading}>SIGN IN</LoadingButton>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
}

export default Login;
