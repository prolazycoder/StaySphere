import React from "react";
import "./InfoPages.css";

export default function AboutUs() {
    return (
        <div className="info-page-container">
            <div className="info-content-card">
                <h1 className="info-title">About Us</h1>
                <p className="info-last-updated">Last Updated: October 2023</p>

                <section className="info-section">
                    <h2>Our Mission</h2>
                    <p>
                        Welcome to MakeMyTrip! Our mission is to empower every traveler with seamless,
                        affordable, and unforgettable travel experiences. Whether you're booking a luxury
                        hotel stay, a quick cab ride across the city, or planning an international getaway,
                        we strive to be your ultimate travel companion.
                    </p>
                    <p>
                        Founded with the belief that travel broadens the mind and brings the world closer together,
                        we have spent years perfecting a platform that puts the power of choice directly into your hands.
                    </p>
                </section>

                <section className="info-section">
                    <h2>Why Choose Us?</h2>
                    <ul>
                        <li><strong>Unbeatable Prices:</strong> We negotiate the best rates so you don't have to.</li>
                        <li><strong>Vast Network:</strong> Thousands of hotels and cab partners worldwide.</li>
                        <li><strong>24/7 Support:</strong> Our dedicated customer service team is always ready to assist you.</li>
                        <li><strong>Secure Booking:</strong> State-of-the-art encryption ensures your data and payments are safe.</li>
                    </ul>
                </section>

                <section className="info-section">
                    <h2>Our Journey</h2>
                    <p>
                        What started as a small startup in a tiny apartment has grown into a global travel
                        powerhouse. From introducing our first flight booking engine to launching our comprehensive
                        hotel and cab networks, every step of our journey has been guided by one principle: Customer First.
                    </p>
                    <p>
                        Thank you for choosing us to be part of your travel story. Here's to many more adventures together!
                    </p>
                </section>
            </div>
        </div>
    );
}
