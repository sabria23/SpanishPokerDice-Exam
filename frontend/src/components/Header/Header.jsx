import NavBar from "../Navbar/Navbar";
import styles from "./Header.module.css";

export default function Header(){
	return (
		<div className={styles.header}>
            <NavBar/>
		</div>
	);
}