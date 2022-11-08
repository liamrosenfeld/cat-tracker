import React from "react";
import "./MapHeader.css";

class MapHeader extends React.Component<{}, {}> {
  render() {
    return (
      <div className="Map">
        <header className="Map-header">

          <div className="Map-header-content">
            <img src="/images/logo.svg" className="Map-logo" alt="logo" />
            <p className="Map-header-title">UF Cat Tracker</p>
          </div>

          <button onClick={this.reportButtonClick} className="Map-button">Report</button>

          <button onClick={this.accountButtonClick} className="Account-button">
            <img src="/images/account.svg" className="Account-button image" alt="account" />
          </button>

        </header>
      </div>
    );
  }

  reportButtonClick() {
    alert("Report button clicked");
  }
  accountButtonClick() {
    alert("Account button clicked");
  }
}

export default MapHeader;
