import { NavLink } from "react-router";
import styles from "./Navbar.module.css";

export default function NavBar() {

  return (
    <nav className={styles.nav}>     
      <div className={styles.links}>
        <NavLink  to="/">Home</NavLink>
      </div>
    </nav>
  );
}