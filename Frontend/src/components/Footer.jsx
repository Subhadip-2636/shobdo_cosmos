import { Link } from "react-router-dom";
import { Feather } from "lucide-react";


function Footer() {

  return (

    <footer className="footer">

      <div className="footer-brand">

        <Feather size={20} />

        <span>
          SHOBDO
        </span>

      </div>


      <p>
        তোমার শব্দ, তোমার গল্প।
      </p>


      <div className="footer-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/explore">
          Explore
        </Link>

        <Link to="/write">
          Write
        </Link>

      </div>


      <div className="footer-line" />


      <span className="copyright">

        © {new Date().getFullYear()}
        {" "}
        SHOBDO.
        {" "}
        A home for Bengali voices.

      </span>

    </footer>

  );

}


export default Footer;