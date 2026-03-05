import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Home } from './routes/home';
import { Play } from './routes/play';
import { Hero } from './routes/hero';
import { MusicProvider } from '@/components/menu/musicContext';

function App ()
{
    return (
        <MusicProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Hero />}></Route>
                    <Route path='/home' element={<Home />}></Route>
                    <Route path='/room/:roomId' element={<Play />}></Route>
                </Routes>
            </BrowserRouter>
        </MusicProvider>
    )
}

export default App
