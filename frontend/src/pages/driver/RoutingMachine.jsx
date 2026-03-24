import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";

export default function RoutingMachine({ start, end, onRouteFound }) {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        // Check if both start and end exist and are valid coordinates
        if (!start?.lat || !start?.lng || !end?.lat || !end?.lng) {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
            return;
        }

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        try {
            const control = L.Routing.control({
                waypoints: [
                    L.latLng(Number(start.lat), Number(start.lng)),
                    L.latLng(Number(end.lat), Number(end.lng))
                ],
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                lineOptions: {
                    styles: [{ color: "#10b981", weight: 6, opacity: 0.8 }]
                },
                createMarker: function () { return null; }, // Hide default routing markers as we use our own
                show: false // hides the text instructions box
            }).addTo(map);

            control.on('routesfound', function (e) {
                const routes = e.routes;
                if (routes && routes.length > 0 && onRouteFound) {
                    const summary = routes[0].summary;
                    // convert meters to km, and seconds to minutes
                    onRouteFound({
                        totalDistanceKm: (summary.totalDistance / 1000).toFixed(2),
                        totalTimeMinutes: Math.ceil(summary.totalTime / 60)
                    });
                }
            });

            routingControlRef.current = control;
        } catch (e) {
            console.log("Routing error:", e);
        }

        return () => {
            if (routingControlRef.current && map) {
                try {
                    map.removeControl(routingControlRef.current);
                } catch (e) { }
            }
        };
    }, [map, start, end, onRouteFound]);

    return null;
}
