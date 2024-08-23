// Array to keep track of the markers for each feature collection
let markers = {
    FoodPantry: [],
    HealthCare: [],
    MentalHealth: [],
    ChildCare: [],
    All: []
};

const icons = {
    FoodPantry: './images/pin_violet.png',
    HealthCare: './images/pin_dodgerblue.png',
    MentalHealth: './images/pin_mediumseagreen.png',
    ChildCare: './images/pin_slateblue.png',
    Default: './images/pin_default.png' // Fallback icon
};

// Load the Google Maps API using the API key from the config file
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}`;
script.async = true;
script.defer = true;

script.onload = () => {
    // Initial map load without any markers
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 40.7127753, lng: -74.0059728 }
    });

    // Event listeners for checkboxes
    const check1 = document.getElementById('check1');

    check1.addEventListener('change', function () {
        if (check1.checked && check2.checked && check3.checked && check4.checked) {
            check5.checked = true;
        }
        else {
            check5.checked = false;
        }
        toggleMarkers(this.checked, FoodPantryFeatures, 'FoodPantry', map);
    });

    const check2 = document.getElementById('check2');

    check2.addEventListener('change', function () {
        if (check1.checked && check2.checked && check3.checked && check4.checked) {
            check5.checked = true;
        }
        else {
            check5.checked = false;
        }
        toggleMarkers(this.checked, HealthCareFeatures, 'HealthCare', map);
    });

    const check3 = document.getElementById('check3');
    
    check3.addEventListener('change', function () {
        if (check1.checked && check2.checked && check3.checked && check4.checked) {
            check5.checked = true;
        }
        else {
            check5.checked = false;
        }
        toggleMarkers(this.checked, MentalHealthFeatures, 'MentalHealth', map);
    });

    const check4 = document.getElementById('check4');
    
    check4.addEventListener('change', function () {
        if (check1.checked && check2.checked && check3.checked && check4.checked) {
            check5.checked = true;
        }
        else {
            check5.checked = false;
        }
        toggleMarkers(this.checked, ChildCareFeatures, 'ChildCare', map);
    });

    const check5 = document.getElementById('check5');
    
    check5.addEventListener('change', function () {
        // Handle "Select All" separately
        if (this.checked) {
            // initMap(AllFeatures, 'All', map);
            initMapAll(check1, check2, check3, check4);
        } else {
            // clearMarkers('All');
            clearAll(check1, check2, check3, check4);
        }
    });
};

function initMapAll(check1, check2, check3, check4) {
    check1.checked = true;
    check2.checked = true;
    check3.checked = true;
    check4.checked = true;
    initMap(HealthCareFeatures, 'HealthCare', map);
    initMap(FoodPantryFeaturesFeatures, 'FoodPantry', map);
    initMap(MentalHealthFeatures, 'MentalHealth', map);
    initMap(ChildCareFeatures, 'ChildCare', map);
}

function clearAll(check1, check2, check3, check4) {
    clearMarkers('HealthCare');
    check1.checked = false;
    clearMarkers('FoodPantry');
    check2.checked = false;
    clearMarkers('MentalHealth');
    check3.checked = false;
    clearMarkers('ChildCare');
    check4.checked = false;
}

document.head.appendChild(script);

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

async function initMap(FeatureCollection, collectionKey, map) {
    // Clear existing markers for this feature collection
    clearMarkers(collectionKey);

    for (const feature of FeatureCollection) {
        const address = feature.properties.address;
        try {
            const location = await geocodeAddress(address);
            const marker = addMarker(map, location, feature.properties);
            // Store the marker in the appropriate array
            markers[collectionKey].push(marker);
        } catch (error) {
            console.error(error);
        }
    }
}

function addMarker(map, location, featureProperties) {
    // Determine the type of service and select the appropriate icon
    let iconUrl;
    if (featureProperties.service === 'Food Pantry') {
        iconUrl = icons.FoodPantry;
    } else if (featureProperties.service === 'Health Care') {
        iconUrl = icons.HealthCare;
    } else if (featureProperties.service === 'Mental Health') {
        iconUrl = icons.MentalHealth;
    } else if (featureProperties.service === 'Child Care') {
        iconUrl = icons.ChildCare;
    } else {
        iconUrl = icons.Default; // Use a default icon if type is not recognized
    }

    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: featureProperties.name || "Location",
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(40, 40) // Set the custom size
        }
    });

    let contentString = `<div style="max-width: 200px;">`;

    for (let key in featureProperties) {
        if (featureProperties.hasOwnProperty(key)) {
            const value = featureProperties[key];
            if (!value) continue;

            if (key == "name") {
                contentString += `<p><strong>${capitalizeFirstLetter(key)}</strong>: <u>${value}</u></p>`;
            } else if (key === "email") {
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

    return marker;
}



// Utility function to clear markers
function clearMarkers(collectionKey) {
    if (markers[collectionKey]) {
        markers[collectionKey].forEach(marker => marker.setMap(null));
        markers[collectionKey] = [];
    }
}

// Function to toggle markers on the map based on checkbox state
function toggleMarkers(isChecked, featureCollection, collectionKey, map) {
    if (isChecked) {
        initMap(featureCollection, collectionKey, map);
    } else {
        clearMarkers(collectionKey);
    }
}

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
