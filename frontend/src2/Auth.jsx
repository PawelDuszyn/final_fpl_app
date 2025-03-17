import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div>
      {isLogin ? (
        <>
          <Login onSwitchToRegister={toggleAuthMode} />
          <p>Don't have an account? <button onClick={toggleAuthMode}>Sign up</button></p>
        </>
      ) : (
        <>
          <Register onSwitchToLogin={toggleAuthMode} />
          <p>Already have an account? <button onClick={toggleAuthMode}>Sign in</button></p>
        </>
      )}
    </div>
  );
}

export default Auth;
