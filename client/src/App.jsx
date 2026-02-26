import { useRef } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Home } from './routes/home';
import { Play } from './routes/play';

function App ()
{
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />}></Route>
                <Route path='/play' element={<Play />}></Route>
                <Route path='/room/:roomId' element={<Play />}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
