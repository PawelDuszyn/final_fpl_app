import React, {useState} from 'react';
import Login from './Login';
import Register from './Register';
import Button from '@mui/material/Button';
import {CSSTransition, SwitchTransition} from 'react-transition-group';
import '../CSS/App.css';

function Welcome({onLogin}) {

    const [isLogin, setIsLogin] = useState(true);

    const toggleView = () => {
        setIsLogin(!isLogin);
    }

    return (
        <div className='centered-container'>{
            <SwitchTransition>
                <CSSTransition
                    key={isLogin
                        ? "login"
                        : "register"}
                    addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
                    classNames="fade-slide">
                    <div>
                        {
                            isLogin
                                ? (
                                    <div>
                                        <Login onLogin={onLogin}/>
                                        <p>Don't have an account?
                                            <Button onClick={toggleView}>Sign up</Button>
                                        </p>
                                    </div>
                                )
                                : (
                                    <div>
                                        <Register/>
                                        <p>Already have an account?
                                            <Button onClick={toggleView}>Log in</Button>
                                        </p>
                                    </div>
                                )
                        }
                        </div>
                </CSSTransition>
            </SwitchTransition>
            }
            </div>
    )
}

export default Welcome;
