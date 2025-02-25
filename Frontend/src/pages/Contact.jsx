
import { useForm, ValidationError } from '@formspree/react';
import './Contact.css';  // Keep your existing styling

const Contact = () => {
  const [state, handleSubmit] = useForm("mbldvqld"); // Replace with your Formspree form ID

  if (state.succeeded) {
    return <p>Thanks for your message! I will get back to you soon.</p>;
  }

  return (
    <div >
      <h1 >Contact Me</h1>
      <p >
        Have a question or want to get in touch? Fill out the form below to send me a message!
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label  htmlFor="email">Email Address</label>
          <input id="email" type="email" name="email" required />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>

        <div >
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows="5" required></textarea>
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>

        <button type="submit"  disabled={state.submitting}>
          {state.submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default Contact;

