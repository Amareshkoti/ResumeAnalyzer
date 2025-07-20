import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl md:text-3xl font-extrabold text-gradient tracking-tight">Analyzer</p>
            </Link>
            <Link to="/upload" className="primary-button w-fit shadow-md transition-transform duration-150 hover:scale-105">
                <span className="px-4 py-2">Upload Resume</span>
            </Link>
        </nav>
    )
}
export default Navbar
