import './PageComponent.css';
import Header from '../../components/common/Header/Header';
import { Link } from 'react-router-dom';

const PageComponent = () => {
  return (
    <div className="wiki-container">
      <Header/>

      <div className="wiki-content">
        {/* <div className="tab-navigation">
          <Link to="/" className="tab active">Main page</Link>
          <Link to="/" className="tab active">Read</Link>
          <Link to="/" className="tab">View source</Link>
        </div> */}

        <div className="welcome-section">
          <h2>Welcome to Simple Wiki</h2>
          <p>
            The Simple Wiki is a reference written and maintained by the players. Please feel free to contribute by creating new articles or expanding on existing ones.
          </p>
          <p>
            We currently have 65 active users maintaining 15,513 pages (2,105 articles). Check out the wiki in other languages: English • 한국어 • 中文.
          </p>
        </div>

        <div className="about-section">
          <h3>About Simple Wiki</h3>
          <p>
            Simple Wiki is a magical action rogue-lite set in a world where every pixel is physically simulated. Fight, explore, melt, burn, freeze, and evaporate your way through the procedurally generated world using spells you've collected and combined however you want.
          </p>
          <p>
            Simple Wiki is inspired by underground classics such as Liero, falling sand games, and modern rogue-like-likes, Lites and Lite-likes.
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default PageComponent;