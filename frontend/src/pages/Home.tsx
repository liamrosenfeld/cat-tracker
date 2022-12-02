import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

class Home extends React.Component<{}, { test: string; }> {
  constructor(props: any) {
    super(props);
    this.state = { test: "" };
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src="/images/logo.svg" className="App-logo" alt="logo" />
          <p>TEMP HOME PAGE</p>
        </header>
        <Link className="App-link" to="/other">Other </Link>
        <Link className="App-link" to="/map">Map</Link>
        <Link className="App-link" to="/login">login</Link>
        <Link className="App-link" to="/register">register</Link>
        <button onClick={this.testAPI}>Test API</button>
        <p>API Returned: {this.state.test}</p>
      </div>
    );
  }

  testAPI = async () => {
    const response = await fetch('/api/test');
    console.log(response.status);
    const data = await response.text();
    this.setState({
      test: data
    });
  };
}

export default Home;
