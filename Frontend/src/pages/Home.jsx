
import './Home.css';

const HomePage = () => {
  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to FocusFuze</h1>
          <p className="hero-tagline">Empower Your Productivity</p>
          <p className="hero-desc">
            Take control of your day with FocusFuze – the all-in-one solution for setting goals, 
            scheduling tasks, and capturing insights from videos. Transform chaos into clarity 
            and achieve more, effortlessly.
          </p>
          <div className="hero-buttons">
            <button className="hero-btn primary-btn">Get Started Now</button>
            <button className="hero-btn secondary-btn"   onClick={() => window.open("https://www.youtube.com/watch?v=pY5dqOt33Js", "_blank")}>Watch Demo</button>
          </div>
        </div>
        <div className="hero-images">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT63I_uW6Y1-MVI6HdJsRG_35x5deXy40X3U-A9GVf1AiWXvyQ09WpY5Pz0STA9n6iHHu4&usqp=CAU" 
            alt="Goal Setting" 
            className="hero-image hero-image-1" 
          />
          <img 
            src="https://media.istockphoto.com/id/1281243724/vector/tiny-people-developing-self-control-system.jpg?s=612x612&w=0&k=20&c=cUIG--oBtTmrd_osFV5O91si0UQXxiYbNiOaz8vLuKY=" 
            alt="Scheduling" 
            className="hero-image hero-image-2" 
          />
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMlTjv3-5P8uQRWr4oRMZcWoz8LkJl5mC3QA&s" 
            alt="Video Notes" 
            className="hero-image hero-image-3" 
          />
          <img 
            src="https://img.freepik.com/premium-vector/task-management-illustration-concept_108061-1992.jpg?semt=ais_hybrid" 
            alt="Productivity" 
            className="hero-image hero-image-4" 
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-item">
          <img 
            src="https://media.istockphoto.com/id/1281243724/vector/tiny-people-developing-self-control-system.jpg?s=612x612&w=0&k=20&c=cUIG--oBtTmrd_osFV5O91si0UQXxiYbNiOaz8vLuKY=" 
            alt="Goal Setting" 
            className="feature-image feature-left" 
          />
          <div className="feature-content">
            <h2 className="feature-title">Set Your Goals</h2>
            <p className="feature-desc">
            Define personal goals, track your progress, and stay motivated with clear milestones. 
              Whether it’s a career aspiration, fitness target, or personal project, FocusFuze helps 
              you break it down into actionable steps. Visualize your journey with intuitive progress 
              trackers and celebrate every win along the way.
            </p>
            <p className="feature-benefit">
              <strong>Why it matters:</strong> Stay focused, avoid overwhelm, and turn your dreams 
              into measurable achievements with a system designed to keep you on track.
            </p>
            <button className="feature-btn" >Get Started</button>
          </div>
        </div>

        <div className="feature-item feature-reverse">
          <img 
            src="https://img.freepik.com/premium-vector/managers-team-organize-project-calendar-professional-manager-workers-working-time-planner-calendars-teamwork-activity-organization-plan-illustration-deadline-reminder-task-planner_229548-19.jpg" 
            alt="Calendar Scheduling" 
            className="feature-image feature-right" 
          />
          <div className="feature-content">
            <h2 className="feature-title">Smart Scheduling</h2>
            <p className="feature-desc">
            Plan your day with an intuitive calendar that syncs effortlessly across all your devices. 
              Schedule tasks, meetings, and personal time with drag-and-drop simplicity. Set reminders, 
              prioritize tasks, and get a clear overview of your week to ensure nothing slips through 
              the cracks.
            </p>
            <p className="feature-benefit">
              <strong>Why it matters:</strong> Take charge of your schedule, reduce stress, and make 
              time for what truly counts with a tool that adapts to your busy life.
            </p>
            <button className="feature-btn">Get Started</button>
          </div>
        </div>

        <div className="feature-item">
          <img 
            src="https://img.freepik.com/premium-vector/concept-distance-online-education-vector-illistration_131728-168.jpg" 
            alt="Video Notes" 
            className="feature-image feature-left" 
            height="500px"
            width="800px"
          />
          <div className="feature-content">
            <h2 className="feature-title">Video Notes</h2>
            <p className="feature-desc">
            Save YouTube videos and create detailed notes while watching, all in one place. Highlight 
              key moments, jot down insights, and organize your learning into searchable categories. 
              Whether it’s a tutorial, lecture, or inspiration, FocusFuze turns passive watching into 
              active productivity.
            </p>
            <p className="feature-benefit">
              <strong>Why it matters:</strong> Retain more from every video, build a personal knowledge 
              library, and access your notes anytime to fuel your growth.
            </p>
            <button className="feature-btn">Get Started</button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="about-content">
          <h2 className="section-title">About FocusFuze</h2>
          <p className="about-desc">
          FocusFuze is designed to help individuals and teams stay organized, focused, and productive. Our mission is to provide an intuitive, easy-to-use platform that helps you manage your goals, track progress, and collaborate effectively, so you can achieve more each day.
          FocusFuze is here to help you prioritize what matters most and keep you on track.
            Our mission is to help you stay organized and achieve your goals with innovative tools.
          </p>
        </div>
      </section>

      {/* Review Section */}
      <section className="review-section">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="review-container">
          <div className="review-item">
            <img 
              src="https://img.freepik.com/free-vector/hand-drawn-star-icon_23-2147882315.jpg" 
              alt="Review Star" 
              className="review-icon" 
            />
            <p className="review-text">FocusFuze transformed how I manage my daily tasks!</p>
            <span className="review-author">- John Doe</span>
          </div>
          <div className="review-item">
            <img 
              src="https://img.freepik.com/free-vector/hand-drawn-star-icon_23-2147882315.jpg" 
              alt="Review Star" 
              className="review-icon" 
            />
            <p className="review-text">The video notes feature is a game-changer.</p>
            <span className="review-author">- Jane Smith</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2 className="section-title">Get in Touch</h2>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" className="contact-input" />
          <input type="email" placeholder="Your Email" className="contact-input" />
          <textarea placeholder="Your Message" className="contact-textarea"></textarea>
          <button type="submit" className="contact-btn">Send Message</button>
        </form>
      </section>
    </div>
  );
};

export default HomePage;