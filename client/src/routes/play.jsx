import { PhaserGame } from '../PhaserGame';
import { useRef } from 'react';

export const Play = () => {
    const phaserRef = useRef();

    return (
        <div id = "app">
            <PhaserGame ref = {phaserRef} />
        </div>
    )
}