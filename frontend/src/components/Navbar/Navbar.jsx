import { NavLink, Link } from "react-router";
import Styles from "./Navbar.module.css";

export default function NavBar() {
  const itemCss = Styles["nav-element"];

  function styleIt({ isActive }) {
    return isActive
      ? `${itemCss} ${Styles.active}`
      : itemCss;
  }


  return (
    <nav className={Styles.nav}>   
      <Link to="/" className={Styles.icon}>
        Spanish-Poker-Dice
      </Link>  
      
      <div className={Styles.links}>
        <NavLink className={styleIt}  to="/tournaments">Tournaments</NavLink>
        <NavLink className={styleIt}  to="/lobby">Lobby</NavLink>
        <NavLink className={styleIt}  to="/howToPlay">How to play</NavLink>
        <NavLink className={styleIt}  to="/about">About</NavLink>
      </div>
    </nav>
  );
}