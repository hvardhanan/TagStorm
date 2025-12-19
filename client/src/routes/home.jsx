import { HomeComponent } from "../components/homeComponent/homeComponent"

export const Home = () => {
    return(
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems:'center',
            justifyContent: 'center',
            backgroundColor: '#000'
        }}>
            <HomeComponent />
        </div>
    )
}