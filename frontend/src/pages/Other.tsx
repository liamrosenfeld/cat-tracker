import React from 'react';
import { Link } from 'react-router-dom'
import './Home.css';

function Other() {
  return (
    <div className="App">
      <header className="App-header">
        <p>This is the other page</p>
        <Link to="/">Home</Link>
      </header>
    </div>
  );
}

export default Other;
