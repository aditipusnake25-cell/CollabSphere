import { useState } from "react";
import "../css/Profile.css";

function Profile() {
  const [name, setName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [email, setEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );
  const [message, setMessage] = useState("");

  const handleSave = (e) => {
    e.preventDefault();

    localStorage.setItem("userName", name.trim());
    localStorage.setItem("userEmail", email.trim());

    setMessage(
      "Details saved in this browser. Backend profile updates are not connected yet."
    );
  };

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <h1>My Profile</h1>
        <p>Manage your CollabSphere account details.</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {(name.trim().charAt(0) || "U").toUpperCase()}
        </div>

        <h2>{name || "Your Name"}</h2>
        <p>{email || "Your email address"}</p>

        <form onSubmit={handleSave} className="profile-form">
          <label htmlFor="profile-name">Full Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />

          <label htmlFor="profile-email">Email Address</label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <button type="submit">Save Details</button>
        </form>

        {message && <p className="profile-message">{message}</p>}
      </div>
    </div>
  );
}

export default Profile;