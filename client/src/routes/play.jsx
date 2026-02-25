import { PhaserGame } from '../PhaserGame';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const Play = () => {
    const phaserRef = useRef();
    const navigate = useNavigate();

    const sceneKey = window.localStorage.getItem('selectedMap');

    if (!sceneKey) {
        navigate('/');
        return null;
    }

    return (
        <div>
            <PhaserGame ref={phaserRef} sceneKey={sceneKey} />
        </div>
    );
};
