import React from "react"
import "./AccountPage.css"

const AccountPage: React.FC = () => {
  return (
    <div className="account-page">
      <div className="account-sidebar">
        <div className="user-profile-summary">
          <div className="user-avatar-container">
            <img src="/images/avatar-profile-placeholder.png" alt="Profile Avatar" className="user-avatar" />
            <div className="user-name">Name</div>
          </div>
          <button className="join-vip-button">Join VIP</button>
        </div>
        <nav className="account-nav">
          <ul>
            <li>
              <a href="#" className="active">
                My Account
              </a>
            </li>
            <li>
              <a href="#">History</a>
            </li>
            <li>
              <a href="#">Watch Later</a>
            </li>
            <li>
              <a href="#">Reservation</a>
            </li>
            <li>
              <a href="#">Subtitle Translation</a>
            </li>
            <li>
              <a href="#">Logout</a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="account-content">
        <h2>My Account</h2>

        <section className="profile-section card">
          <h3>Profile</h3>
          <div className="profile-details">
            <img src="/images/avatar-profile-placeholder.png" alt="Profile Avatar" className="profile-detail-avatar" />
            <div className="profile-info">
              <div className="profile-name">Name</div>
              <div className="profile-meta">
                <span>Gender: Female</span> | <span>Date of Birth: --/--/----</span> | <span>UID: </span>
              </div>
            </div>
            <button className="edit-button">Edit</button>
          </div>
        </section>

        <section className="vip-section card">
          <h3>VIP</h3>
          <div className="vip-card">
            <div className="vip-info">
              <h4>Become VIP</h4>
              <p>You're not a member Yet. Join to enjoy tons of shows and skip ads.</p>
            </div>
            <button className="join-vip-cta-button">Join VIP{'>'}</button>
          </div>
        </section>

        <section className="security-section card">
          <h3>Account and security</h3>
          <div className="security-item">
            <span>Email t***@gmail.com</span>
            <button className="action-button">Activate</button>
          </div>
          <div className="security-item">
            <span>Mobile number Not Set</span>
            <button className="action-button">Set</button>
          </div>
          <div className="security-item">
            <span>Password Not Set</span>
            <button className="action-button">Set</button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AccountPage
