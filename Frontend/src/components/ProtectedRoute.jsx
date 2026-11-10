import React from "react";
export default function ProtectedRoute({ user, children, onLoginRequired }) {
    if (!user) {
        return <div className="empty-state">
            <h2>Login required</h2>
            <p>Please log in to access your workspace.</p>
            <button className="button button-primary" onClick={onLoginRequired}>Go to login</button>
        </div>;
    }
    return children;
}
