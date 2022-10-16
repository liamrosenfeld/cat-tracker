import React from 'react';
import { Link } from 'react-router-dom'
import './Home.css';

function NoPage() {
  return (
    <div className="App">
      <p>404 Error: Page Not Found</p>
      <Link to="/">Back Home</Link>
    </div>
  );
}

export default NoPage;
