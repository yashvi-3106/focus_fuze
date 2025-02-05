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
          <div className="background-image"></div>
          <div className="gradient-overlay"></div>
          <div className="circle-effect circle-one"></div>
          <div className="circle-effect circle-two"></div>
          <div className="circle-effect circle-three"></div>
        </div>

        {/* New Image Section */}
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
        <p className="service-description">sdfghjkl</p>
      </div>

      <div className="features-card features-card-2">
        <h3 className="service-card-title">Personal Goal</h3>
        <p className="service-description">sdfghjkl</p>
      </div>

      <div className="features-card features-card-3">
        <h3 className="service-card-title">Personal Goal</h3>
        <p className="service-description">sdfghjkl</p>
      </div>

     </div>

     <div className="">
      <div>

      </div>
     </div>
      







    </div>
  );
};

export default HomePage;
