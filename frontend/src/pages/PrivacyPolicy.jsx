import React from "react";
import "./InfoPages.css";

export default function PrivacyPolicy() {
    return (
        <div className="info-page-container">
            <div className="info-content-card">
                <h1 className="info-title">Privacy Policy</h1>
                <p className="info-last-updated">Last Updated: January 2024</p>

                <section className="info-section">
                    <h2>Introduction</h2>
                    <p>
                        Your privacy is critically important to us. This Privacy Policy outlines the types of personal
                        information that is received and collected by our platform and how it is used. We are committed
                        to securing your data and keeping it confidential.
                    </p>
                </section>

                <section className="info-section">
                    <h2>Information We Collect</h2>
                    <p>We collect several different types of information for various purposes to provide and improve our service to you:</p>
                    <ul>
                        <li><strong>Personal Data:</strong> Name, email address, phone number, and billing information.</li>
                        <li><strong>Usage Data:</strong> Information on how the Service is accessed and used (IP addresses, browser type, pages visited).</li>
                        <li><strong>Location Data:</strong> We may use and store information about your location if you give us permission (e.g., for Cab booking GPS features).</li>
                    </ul>
                </section>

                <section className="info-section">
                    <h2>How We Use Your Data</h2>
                    <p>We use the collected data for various purposes:</p>
                    <ul>
                        <li>To provide and maintain our Service.</li>
                        <li>To notify you about changes to our Service.</li>
                        <li>To provide customer support.</li>
                        <li>To process your bookings and payments securely.</li>
                        <li>To detect, prevent and address technical issues.</li>
                    </ul>
                </section>

                <section className="info-section">
                    <h2>Data Security</h2>
                    <p>
                        The security of your data is important to us, but remember that no method of transmission
                        over the Internet, or method of electronic storage is 100% secure. While we strive to use
                        commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>
                </section>
            </div>
        </div>
    );
}
