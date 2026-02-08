import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;

export const connectCabSocket = ({ onConnect, onError } = {}) => {
    const socket = new SockJS("http://localhost:8080/ws-driver");

    client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: () => { },
        onConnect: () => onConnect && onConnect(client),
        onStompError: (frame) => {
            console.error("STOMP ERROR:", frame);
            onError && onError(frame);
        },
    });

    client.activate();
    return client;
};

// ✅ NEW
export const subscribeDriverRequests = ({ driverId, onMessage }) => {
    if (!client || !client.connected) {
        console.warn("Socket not connected yet");
        return null;
    }

    const topic = `/topic/driver/${driverId}`;
    console.log("Subscribing to:", topic);

    return client.subscribe(topic, (msg) => {
        try {
            const body = JSON.parse(msg.body);
            onMessage && onMessage(body);
        } catch (e) {
            console.error("Invalid socket msg:", msg.body);
        }
    });
};

export const disconnectCabSocket = () => {
    try {
        if (client) client.deactivate();
    } catch { }
    client = null;
};
