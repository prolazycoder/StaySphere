import React, { useEffect, useMemo, useState } from "react";
import "./DriverRequests.css";
import { connectCabSocket, disconnectCabSocket } from "../socket/cabSocket";
import { driverAcceptRide, driverRejectRide } from "../api/cabApi";

const DriverRequests = () => {
    const userId = localStorage.getItem("userId"); // from jwtUtils storeUserFromToken
    const [connected, setConnected] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loadingRideId, setLoadingRideId] = useState(null);

    const topic = useMemo(() => {
        if (!userId) return null;
        return `/topic/driver/${userId}`;
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        let sub = null;

        connectCabSocket({
            onConnect: (stomp) => {
                setConnected(true);

                sub = stomp.subscribe(topic, (msg) => {
                    const data = JSON.parse(msg.body);

                    if (data?.event === "NEW_RIDE_REQUEST") {
                        setRequests((prev) => {
                            if (prev.some((x) => x.rideId === data.rideId)) return prev;
                            return [{ ...data }, ...prev];
                        });
                    }
                });
            },
        });

        return () => {
            try {
                if (sub) sub.unsubscribe();
            } catch { }
            disconnectCabSocket();
            setConnected(false);
        };
    }, [userId, topic]);

    const accept = async (rideId) => {
        try {
            setLoadingRideId(rideId);
            await driverAcceptRide(rideId);
            localStorage.setItem("activeRideId", rideId);
            alert("✅ Ride Accepted");
            setRequests((p) => p.filter((x) => x.rideId !== rideId));
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Accept failed");
        } finally {
            setLoadingRideId(null);
        }
    };

    const reject = async (rideId) => {
        try {
            setLoadingRideId(rideId);
            await driverRejectRide({ driverId: userId, rideId });
            alert("✅ Ride Rejected");
            setRequests((p) => p.filter((x) => x.rideId !== rideId));
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Reject failed");
        } finally {
            setLoadingRideId(null);
        }
    };

    return (
        <div className="reqWrap">
            <h2 className="reqTitle">📩 Ride Requests</h2>

            <div className="reqInfo">
                <b>Socket:</b>{" "}
                <span className={connected ? "ok" : "bad"}>
                    {connected ? "CONNECTED" : "DISCONNECTED"}
                </span>
            </div>

            {requests.length === 0 ? (
                <div className="reqEmpty">No ride request yet... ✅</div>
            ) : (
                <div className="reqGrid">
                    {requests.map((r) => (
                        <div key={r.rideId} className="reqCard">
                            <b>RideId:</b> {r.rideId}
                            <div className="reqLoc">
                                <p><b>Pickup:</b> {r.pickupLat}, {r.pickupLng}</p>
                                <p><b>Drop:</b> {r.dropLat}, {r.dropLng}</p>
                            </div>

                            <div className="reqBtns">
                                <button className="btnGreen" disabled={loadingRideId === r.rideId} onClick={() => accept(r.rideId)}>
                                    Accept
                                </button>
                                <button className="btnRed" disabled={loadingRideId === r.rideId} onClick={() => reject(r.rideId)}>
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DriverRequests;
