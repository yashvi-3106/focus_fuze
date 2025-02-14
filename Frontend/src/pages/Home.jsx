import "./Home.css";

const HomePage = () => {
  return (
    <div className="container8">
      <div className="hero-section">
        <div className="container">
          <h2 className="hero-title">Welcome to FocusFuze!</h2>
          <p className="hero-description">
            Organize. Prioritize. Achieve. <br />
            Manage your tasks with ease <br /> and accomplish more every day.
          </p>
          <a href="#contact" className="cta-button">
            Get Started 
          </a>
        </div>
        <div className="background-overlay">
          <div className="circle-effect circle-one"></div>
          <div className="circle-effect circle-two"></div>
          <div className="circle-effect circle-three"></div>
        </div>

        
        <div className="image-container1">
          <img
            src="https://img.freepik.com/premium-vector/task-management-illustration-concept-flat-illustration-isolated-white-background_701961-5187.jpg"
            alt="Image 1"
            className="image1"
          />
        </div>
        <div className="image-container2">
          <img
            src="https://img.freepik.com/premium-vector/task-management-illustration-concept-flat-illustration-isolated-white-background_701961-5187.jpg"
            alt="Image 1"
            className="image1"
          />
        </div>
        <div className="image-container3">
          <img
            src="https://img.freepik.com/premium-vector/task-management-illustration-concept-flat-illustration-isolated-white-background_701961-5187.jpg"
            alt="Image 1"
            className="image1"
          />
        </div>
        <div className="image-container4">
          <img
            src="https://img.freepik.com/premium-vector/task-management-illustration-concept-flat-illustration-isolated-white-background_701961-5187.jpg"
            alt="Image 1"
            className="image1"
          />
        </div>
      </div>

      <div className="features">Features</div>
      <div className="features-list">
        <div className="features-card features-card-1">
          <h3 className="service-card-title">Personal Goal</h3>
          <p className="service-description">
            Set and track your personal goals <br /> with ease. Stay motivated <br /> with clear deadlines, progress tracking, <br /> and helpful reminders.
          </p>
        </div>

        <div className="features-card features-card-2">
          <h3 className="service-card-title">Notes</h3>
          <p className="service-description">
          Organize your thoughts and ideas <br /> effortlessly. Keep track of important <br /> notes with easy access, clear <br /> categorization, and quick updates.
          </p>
        </div>

        <div className="features-card features-card-3">
          <h3 className="service-card-title">Calendar</h3>
          <p className="service-description">
          Plan your day with ease. <br /> Schedule appointments, events, and <br /> tasks effortlessly with customizable <br /> reminders and clear time slots.
          </p>
        </div>

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
