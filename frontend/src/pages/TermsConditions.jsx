import React from "react";
import "./InfoPages.css";

export default function TermsConditions() {
    return (
        <div className="info-page-container">
            <div className="info-content-card">
                <h1 className="info-title">Terms & Conditions</h1>
                <p className="info-last-updated">Last Updated: March 2024</p>

                <section className="info-section">
                    <h2>1. Agreement to Terms</h2>
                    <p>
                        By accessing or using our platform, you agree to be bound by these Terms and Conditions.
                        If you disagree with any part of the terms, then you may not access the service. These terms
                        apply to all visitors, users, and others who access or use the Service.
                    </p>
                </section>

                <section className="info-section">
                    <h2>2. User Accounts</h2>
                    <p>
                        When you create an account with us, you must provide information that is accurate, complete,
                        and current at all times. Failure to do so constitutes a breach of the Terms, which may result
                        in immediate termination of your account on our Service.
                    </p>
                    <p>
                        You are responsible for safeguarding the password that you use to access the Service and for
                        any activities or actions under your password.
                    </p>
                </section>

                <section className="info-section">
                    <h2>3. Bookings and Cancellations</h2>
                    <ul>
                        <li>All bookings are subject to availability and acceptance by our partner vendors.</li>
                        <li>Cancellation policies vary by service provider (Hotels, Cabs). Please review specific policies during checkout.</li>
                        <li>Refunds for eligible cancellations will be processed within 5-7 business days.</li>
                    </ul>
                </section>

                <section className="info-section">
                    <h2>4. Limitation of Liability</h2>
                    <p>
                        In no event shall we, nor our directors, employees, partners, agents, suppliers, or affiliates,
                        be liable for any indirect, incidental, special, consequential or punitive damages, including
                        without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                    </p>
                </section>
            </div>
        </div>
    );
}
