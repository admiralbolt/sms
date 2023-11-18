import { Outlet, Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <>
      <nav>
        <ul>
          <li><Link to="/map">Map</Link></li>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>

      <Outlet />
    </>
  );
}

export default NavBar;