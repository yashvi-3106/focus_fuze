import "./Home.css";

const HomePage = () => {
  return (
    <div className="container8">
      <div className="hero-section">
        <div className="welcome">
          <h2>Welcome to FocusFuze !</h2>
        </div>
        <div className="welcome-text">
          <p> Organize. Prioritize. Achieve. <br />
          Manage your tasks with ease <br /> and accomplish more every day.</p>
        </div>
        <div className="get-started-button">
          Get Started
        </div>

        <div className="rect" >
        <img className="icon-goal" src="https://png.pngtree.com/png-vector/20190716/ourmid/pngtree-goal-icon-for-your-project-png-image_1545201.jpg"   ></img>
        </div>
        <div className="rect1" >
        <img className="icon-goal1" src="https://png.pngtree.com/png-vector/20190716/ourmid/pngtree-goal-icon-for-your-project-png-image_1545201.jpg"   ></img>
        </div>
        <div className="rect2" >
        <img className="icon-goal2" src="https://png.pngtree.com/png-vector/20190716/ourmid/pngtree-goal-icon-for-your-project-png-image_1545201.jpg"   ></img>
        </div>

        <div className="background-overlay">
          <div className="circle-effect circle-one"></div>
          <div className="circle-effect circle-two"></div>
          <div className="circle-effect circle-three"></div>
        </div>


      

       
      </div>

      <div className="features">Features</div>
      <div className="features-list">
        <div className="features-card features-card-1">
        <div className="service-card-icon"><img src="https://png.pngtree.com/png-clipart/20230330/original/pngtree-achievable-goal-silhouette-wellness-icon-transparent-background-png-image_9008664.png" alt="" /></div>
          <h3 className="service-card-title1">Personal Goal</h3>
          <p className="service-description">
            Set and track your personal goals  with ease. Stay <br /> motivated  with clear  deadlines progress tracking, <br />  and helpful reminders.
          </p>
        </div>

        <div className="features-card features-card-2">
        <div className="service-card-icon"><img src="https://png.pngtree.com/png-clipart/20230330/original/pngtree-achievable-goal-silhouette-wellness-icon-transparent-background-png-image_9008664.png" alt="" /></div>
          <h3 className="service-card-title2">Notes</h3>
          <p className="service-description">
          Organize your thoughts and ideas effortlessly. <br /> Keep track of important  notes with easy access <br /> clear categorization, and quick updates.
          </p>
        </div>

        <div className="features-card features-card-3">
        <div className="service-card-icon"><img src="https://png.pngtree.com/png-clipart/20230330/original/pngtree-achievable-goal-silhouette-wellness-icon-transparent-background-png-image_9008664.png" alt="" /></div>
          <h3 className="service-card-title3">Calendar</h3>
          <p className="service-description">
          Plan your day with ease.  Schedule appointments, <br /> events, and  tasks effortlessly with  customizable <br /> reminders and clear time slots.
          </p>
        </div>

      </div>



      <div className="quotes-section">
  <div className="rope"></div>
  <div className="quotes-container">
    <div className="quote-box">
      <div className="quote-content">
        <img className="quote-icon" src="https://cdn-icons-png.flaticon.com/512/1041/1041886.png" alt="Focus Icon" />
      </div>
      <div className="quote-text">Stay focused and never give up!</div>
    </div>

    <div className="quote-box">
      <div className="quote-content">
        <img className="quote-icon" src="https://cdn-icons-png.flaticon.com/512/854/854894.png" alt="Time Icon" />
      </div>
      <div className="quote-text">Your time is precious, use it wisely.</div>
    </div>

    <div className="quote-box">
      <div className="quote-content">
        <img className="quote-icon" src="https://cdn-icons-png.flaticon.com/512/1160/1160358.png" alt="Success Icon" />
      </div>
      <div className="quote-text">Big achievements start with small steps.</div>
    </div>

    <div className="quote-box">
      <div className="quote-content">
        <img className="quote-icon" src="https://cdn-icons-png.flaticon.com/512/1532/1532459.png" alt="Productivity Icon" />
      </div>
      <div className="quote-text">Productivity is the key to success!</div>
    </div>

    <div className="quote-box">
      <div className="quote-content">
        <img className="quote-icon" src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png" alt="Plan Icon" />
      </div>
      <div className="quote-text">Plan, execute, and achieve.</div>
    </div>

    <div className="quote-box">
      <div className="quote-content">
        <img src="https://cdn.pixabay.com/photo/2023/01/05/21/28/target-7699762_640.png" alt="Success" className="quote-icon" />
      </div>
      <div className="quote-text">Success is the sum of small efforts!</div>
    </div>

    <div className="quote-box">
      <div className="quote-content">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKxxCRkTDhs4B2pNwnE-bSmMrNJspWmbTtmCAQBCiZCxswx7U9-bYF_GNU23dpV3OnhBg&usqp=CAU" alt="Growth" className="quote-icon" height="10px" width="10px" />
      </div>
      <div className="quote-text">Every day is a step towards growth!</div>
    </div>
  </div>
</div>







      {/* About Us Section */}
      <div className="about-us-section">
        <h2 className="about-us-title">About Us</h2>
        <p className="about-us-description">
          FocusFuze is designed to help individuals and teams stay organized, focused, and productive. Our mission is to provide an intuitive, easy-to-use platform that helps you manage your goals, track progress, and collaborate effectively, so you can achieve more each day.
        </p>
        <p className="about-us-description">
          Whether you are working solo or with a team, FocusFuze is here to help you prioritize what matters most and keep you on track.
        </p>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="reviews-title">What Our Users Say</h2>
        <div className="reviews-list">
          <div className="review-card">
            <p className="review-text">
              FocusFuze has completely transformed the way I manage my tasks. It is simple, effective, and keeps me on track!
            </p>
            <p className="review-author">– John D.</p>
          </div>

          <div className="review-card">
            <p className="review-text">
              Our team productivity has increased exponentially since we started using FocusFuze. A must-have for any team!
            </p>
            <p className="review-author">– Sarah T.</p>
          </div>

          <div className="review-card">
            <p className="review-text">
              I love how FocusFuze helps me stay organized with my personal goals. It’s easy to use and keeps me motivated.
            </p>
            <p className="review-author">– Michael P.</p>
          </div>
        </div>
      </div>

      

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            &copy; 2025 FocusFuze | All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
