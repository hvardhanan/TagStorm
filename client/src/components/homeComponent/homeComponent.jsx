import * as styles from "./home.module.css";
import { useNavigate } from "react-router-dom";

export const HomeComponent = () => {
    const navigate = useNavigate();

    return(
        <div>
            <button className={styles.playBtn} onClick={() => {navigate('/play')}}> Play </button>
        </div>
    )
}