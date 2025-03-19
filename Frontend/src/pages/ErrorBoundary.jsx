import  { Component } from "react";
import { Typography, Button } from "@mui/material";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Typography variant="h5" color="error">Something went wrong.</Typography>
          <Typography variant="body1" style={{ margin: "10px 0" }}>
            An unexpected error occurred. Please try refreshing the page.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;