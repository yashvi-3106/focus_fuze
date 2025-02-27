import { useForm, ValidationError } from '@formspree/react';
import './Contact.css'; // Link to the CSS file

const Contact = () => {
  const [state, handleSubmit] = useForm("mbldvqld"); // Replace with your Formspree form ID

  if (state.succeeded) {
    return (
      <div className="success-container">
        <img 
          src="https://img.freepik.com/premium-vector/thank-you-pop-up-window_213092-72.jpg" 
          alt="Thanks for reaching out" 
          className="success-gif"
        />
      </div>
    );
  }

  return (
    <div className="contact-container">
      <div className="contact-left">
        <h1>Contact Me</h1>
        <p>Have a question or want to get in touch? Fill out the form below to send me a message!</p>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" name="email" required />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="5" required></textarea>
            <ValidationError prefix="Message" field="message" errors={state.errors} />
          </div>

          <button type="submit" className="submit-button" disabled={state.submitting}>
            {state.submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <div className="contact-right">
        <img 
          src="https://img.freepik.com/free-vector/organic-flat-man-customer-support_23-2148893295.jpg?semt=ais_hybrid" 
          alt="Contact" 
          className="contact-icon" 
        />
        <p className="contact-description">
          Feel free to reach out anytime! I am always happy to connect and discuss projects, ideas, or collaborations.
        </p>
      </div>
    </div>
  );
};

export default Contact;
