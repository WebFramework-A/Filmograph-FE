import { NavLink } from "react-router-dom";

const Navbar = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? "#34C3F1" : "white",
    fontWeight: isActive ? "bold" : "normal",
    textDecoration: "none",
    transition: "0.2s",
  });

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        padding: "1rem 2rem",
        backgroundColor: "#15151589",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <NavLink to="/detail" style={linkStyle}>
        상세 페이지
      </NavLink>
    </nav>
  );
};

export default Navbar;