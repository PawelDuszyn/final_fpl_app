import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Player from './Player'; 
import { use } from 'react';

function PickTeam({ onLogOut }) {
   
    return (
        <div className=''>
            <div className='centered-container'>
                <div className='pitch'>
                    <div className='pitch-line pitch-line-goalkeepers'>
                        
                    </div>
                    <div className='pitch-line pitch-line-defenders'>
                        
                    </div>
                    <div className='pitch-line pitch-line-midfielders'>
                        
                    </div>
                    <div className='pitch-line pitch-line-forwards'>
                        
                    </div>
                    <div className='bench-line bench-line-bench'>
                        <div className='bench'>Bench</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PickTeam;
