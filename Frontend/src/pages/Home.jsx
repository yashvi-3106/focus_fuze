import "./Home.css"
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container1">
      <div className="sub-con">
        <div className="home">
          <img src="https://media.licdn.com/dms/image/v2/D5612AQFYARHhmGbbZQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1692552403544?e=2147483647&v=beta&t=WPgHRo2YLenN8KlbAVvCZUR4oG8aVZHvArfTiqcMC44"  />
          <div className="overlay"></div>
          
            <div className="content">
            Track your progress.
            Achieve your goals.
            Succeed together. 
            </div>

            <a href="#target-section" className="btn">Get Started</a>  

        </div>
      </div>
      <div>
        <div className="text1">
          <p>Features</p>
        </div>
        <div className="text2">
          <p>Everything you need to succeed</p>
        </div>
        <div className="text3">
          <p>Boost your productivity and team collaboration with our comprehensive suite of tools.</p>
        </div>
      </div>
      <div className="section1" id="target-section">
        <div className="img1">
          <img src="https://img.freepik.com/premium-vector/goals-planning-vector-illustration_116137-4767.jpg" alt="" />
        </div>
        <div className="goal-text1">
          <p>Personal Success Hub</p>
        </div>
        <div className="goal-text2">
          <p>Set Up & Achieve</p>
        </div>
        <div className="goal-text3">
          <p>Set your goals, track your progress, and make <br />
             today the day you move one step closer to <br />
             achieving greatness. Lets get started!</p>
        </div>
        <button
            className="personal-goal"
            onClick={() => navigate('/personal-goals')}
          >
            Personal Goals
          </button>
      </div>
      <div className="section4">
        <div>
          <img src="" alt="" />
        </div>
        <div>
          <p></p>
        </div>
        <div>
          <p></p>
        </div>

      </div>
    </div>
  );
};

export default Home;