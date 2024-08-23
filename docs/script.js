// script.js

// Load the Google Maps API using the API key from the config file
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}&callback=initMap`;
script.async = true;
script.defer = true;
document.head.appendChild(script);

// async function loadGeoJSON() {
//     const response = await fetch('./dataset.json');
//     const data = await response.json();
//     return data.features;
// }

async function geocodeAddress(address) {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK') {
                resolve(results[0].geometry.location);
            } else {
                reject('Geocode was not successful for the following reason: ' + status);
            }
        });
    });
}

async function initMap() {
    // Default view of NYC on the map
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 40.7127753, lng: -74.0059728 }
    });

    // const geoJsonFeatures = await loadGeoJSON();

    for (const feature of FeatureCollection) {
        const address = feature.properties.address;
        try {
            const location = await geocodeAddress(address);
            addMarker(map, location, feature.properties);
        } catch (error) {
            console.error(error);
        }
    }
}

function addMarker(map, location, featureProperties) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: featureProperties.name || "Location"
    });

    // Dynamically generate the content string based on the properties
    let contentString = `<div style="max-width: 200px;">`;

    for (let key in featureProperties) {
        if (featureProperties.hasOwnProperty(key)) {
            const value = featureProperties[key];
            // Check if the key is "email" or "phone" to create links
            if (key == "name") {
                contentString += `<p><strong>${capitalizeFirstLetter(key)}</strong>: <u>${value}</u></p>`;
            }
            else if (key === "email") {
                contentString += `<p><strong>${capitalizeFirstLetter(key)}:</strong> <a href="mailto:${value}">${value}</a></p>`;
            } else if (key === "phone") {
                contentString += `<p><strong>${capitalizeFirstLetter(key)}:</strong> <a href="tel:${value}">${value}</a></p>`;
            } else {
                contentString += `<p><strong>${capitalizeFirstLetter(key)}:</strong> ${value}</p>`;
            }
        }
    }

    contentString += `</div>`;

    const infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    marker.addListener('click', () => {
        infowindow.open(map, marker);
    });

    // marker.addListener('mouseover', () => {
    //     infowindow.open(map, marker);
    // });

    // marker.addListener('mouseout', () => {
    //     infowindow.close();
    // });
}

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

initMap();