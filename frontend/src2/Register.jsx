import React, { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import {FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleMouseDownPassword = (event) => event.preventDefault();

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setMessage('Registration successful! You can now log in.');
      } else {
        const errorData = await response.text();
        setMessage(`Error: ${errorData}`);
      }
    } catch (error) {
      setMessage('Error registering');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
        <FormControl
                        sx={{
                            m: 1,
                            width: '25ch'
                        }}
                        variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">Username</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-username"
                            type= 'text'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            endAdornment={<InputAdornment position = "end" > 
                        </InputAdornment>}
                            label="Username"
                            required="required"/>
                    </FormControl>
        </div>
        <div>
          <FormControl
                        sx={{
                            m: 1,
                            width: '25ch'
                        }}
                        variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword
                                ? 'text'
                                : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            endAdornment={<InputAdornment position = "end" > <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end">
                                {
                                    showPassword
                                        ? <VisibilityOff/>
                                        : <Visibility/>
                                }
                            </IconButton>
                        </InputAdornment>}
                            label="Password"
                            required="required"/>
                    </FormControl>
        </div>
        <LoadingButton type="submit" variant="contained" loading={loading}>Register</LoadingButton>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;