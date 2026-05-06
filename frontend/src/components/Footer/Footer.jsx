import Styles from "./Footer.module.css";

export default function Footer() {
    return(
        <footer>
            <div className={Styles["container"]}>
                <div className={Styles["links"]}>
                    <a href="/aboutUs">About us</a>
                    <a href="/privacy">Privacy policy</a>
                    <a href="/terms">Terms  Conidtions</a>
                </div>
            <p className={Styles.footer}>© Spanish Poker Dice 2026</p>
            </div>
            
        </footer>
    );
}