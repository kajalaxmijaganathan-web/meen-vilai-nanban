/* =====================================================
   மீன் விலை நண்பன்
   Fisheries Recommendation Prototype
   ===================================================== */


/* -----------------------------
   SAMPLE HARBOUR DATA
----------------------------- */

const harbours = [
    {
        name: "கடலூர் துறைமுகம்",
        nameEnglish: "Cuddalore Harbour",
        lat: 11.7480,
        lon: 79.7714,
        prices: {
            "வஞ்சிரம்": 480,
            "சூரை": 260,
            "சங்கரா": 350,
            "இறால்": 550,
            "நண்டு": 420,
            "மத்தி": 180
        }
    },

    {
        name: "புதுச்சேரி துறைமுகம்",
        nameEnglish: "Puducherry Harbour",
        lat: 11.9139,
        lon: 79.8145,
        prices: {
            "வஞ்சிரம்": 450,
            "சூரை": 275,
            "சங்கரா": 335,
            "இறால்": 530,
            "நண்டு": 400,
            "மத்தி": 190
        }
    },

    {
        name: "பரங்கிப்பேட்டை துறைமுகம்",
        nameEnglish: "Parangipettai Harbour",
        lat: 11.4937,
        lon: 79.7617,
        prices: {
            "வஞ்சிரம்": 460,
            "சூரை": 250,
            "சங்கரா": 360,
            "இறால்": 570,
            "நண்டு": 410,
            "மத்தி": 175
        }
    }
];


/* -----------------------------
   DEMO LOCATION
   Cuddalore
----------------------------- */

const demoLocation = {
    lat: 11.7480,
    lon: 79.7714
};


/* -----------------------------
   GLOBAL VARIABLES
----------------------------- */

let selectedFish = null;

let userLocation = null;

let recommendationResults = [];


/* -----------------------------
   FISH SELECTION
----------------------------- */

const fishCards = document.querySelectorAll(".fish-card");

fishCards.forEach(card => {

    card.addEventListener("click", () => {

        fishCards.forEach(item => {
            item.classList.remove("selected");
        });

        card.classList.add("selected");

        selectedFish = {
            name: card.dataset.fish,
            basePrice: Number(card.dataset.price)
        };

        document.getElementById("nextToQuantity").disabled = false;

        document.getElementById("selectedFishName").textContent =
            selectedFish.name;

    });

});


/* -----------------------------
   NEXT BUTTON
----------------------------- */

document.getElementById("nextToQuantity")
    .addEventListener("click", () => {

        if (!selectedFish) {
            alert("முதலில் மீன் வகையைத் தேர்வு செய்யுங்கள்.");
            return;
        }

        updateProgress(2);

        goToStep(2);

    });


/* -----------------------------
   SCREEN NAVIGATION
----------------------------- */

function goToStep(step) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active-screen");
    });

    document.getElementById(`step${step}`)
        .classList.add("active-screen");

    updateProgress(step);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* -----------------------------
   PROGRESS
----------------------------- */

function updateProgress(step) {

    const progressSteps =
        document.querySelectorAll(".progress-step");

    progressSteps.forEach((item, index) => {

        if (index < step) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }

    });

}


/* -----------------------------
   GET REAL GPS LOCATION
----------------------------- */

function getLocation() {

    const button =
        document.getElementById("locationButton");

    const message =
        document.getElementById("locationMessage");

    if (!navigator.geolocation) {

        message.textContent =
            "உங்கள் சாதனத்தில் GPS வசதி கிடைக்கவில்லை.";

        return;
    }


    button.textContent = "பெறுகிறது...";
    button.disabled = true;


    navigator.geolocation.getCurrentPosition(

        function(position) {

            userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            message.textContent =
                "✓ உங்கள் இருப்பிடம் பெறப்பட்டது.";

            document.getElementById("locationText")
                .textContent = "இருப்பிடம் பெறப்பட்டது";

            button.textContent = "✓ பெறப்பட்டது";

            button.disabled = false;

        },

        function(error) {

            message.textContent =
                "இருப்பிடத்தைப் பெற முடியவில்லை. Demo location பயன்படுத்தலாம்.";

            button.textContent = "மீண்டும் முயற்சி";

            button.disabled = false;

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );

}


/* -----------------------------
   DEMO LOCATION
----------------------------- */

function useDemoLocation() {

    userLocation = {
        lat: demoLocation.lat,
        lon: demoLocation.lon
    };

    document.getElementById("locationMessage")
        .textContent =
        "✓ Demo: கடலூர் இருப்பிடம் தேர்வு செய்யப்பட்டது.";

    document.getElementById("locationText")
        .textContent = "கடலூர்";

    document.getElementById("locationButton")
        .textContent = "✓ கடலூர்";

}


/* -----------------------------
   HAVERSINE DISTANCE
-----------------------------

   Calculates distance between
   two GPS coordinates.

----------------------------- */

function calculateDistance(lat1, lon1, lat2, lon2) {

    const earthRadius = 6371;

    const dLat =
        degreesToRadians(lat2 - lat1);

    const dLon =
        degreesToRadians(lon2 - lon1);


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(degreesToRadians(lat1)) *
        Math.cos(degreesToRadians(lat2)) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;
}


function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}


/* -----------------------------
   FIND HARBOURS
----------------------------- */

document.getElementById("findHarbours")
    .addEventListener("click", calculateRecommendation);


function calculateRecommendation() {

    if (!selectedFish) {

        alert("முதலில் மீன் வகையைத் தேர்வு செய்யுங்கள்.");

        goToStep(1);

        return;
    }


    const quantity =
        Number(document.getElementById("quantity").value);


    if (!quantity || quantity <= 0) {

        alert("சரியான மீன் அளவை உள்ளிடுங்கள்.");

        return;
    }


    /*
        If user hasn't allowed GPS,
        use demo location for the prototype.
    */

    if (!userLocation) {

        useDemoLocation();

    }


    /* -----------------------------
       AI RECOMMENDATION ENGINE

       Factors:
       1. Fish price
       2. Quantity
       3. Distance
       4. Estimated travel cost
    ----------------------------- */


    recommendationResults =
        harbours.map(harbour => {

            const distance =
                calculateDistance(
                    userLocation.lat,
                    userLocation.lon,
                    harbour.lat,
                    harbour.lon
                );


            const price =
                harbour.prices[selectedFish.name];


            const grossIncome =
                price * quantity;


            /*
               Estimated travel cost.

               For prototype:
               ₹8 per km.
            */

            const travelCost =
                distance * 8;


            const netIncome =
                grossIncome - travelCost;


            /*
               Recommendation score.

               Higher price and lower distance
               produce a better score.
            */

            const priceScore =
                price / 100;

            const distancePenalty =
                distance * 0.5;

            const score =
                priceScore -
                distancePenalty;


            return {
                ...harbour,

                distance,
                price,
                quantity,

                grossIncome,
                travelCost,
                netIncome,

                score
            };

        });


    /* Sort by AI score */

    recommendationResults.sort(
        (a, b) => b.score - a.score
    );


    showRecommendation();

}


/* -----------------------------
   SHOW RECOMMENDATION
----------------------------- */

function showRecommendation() {

    const best =
        recommendationResults[0];


    const quantity =
        Number(document.getElementById("quantity").value);


    /* Result heading */

    document.getElementById("resultFishName")
        .textContent =
        `${selectedFish.name} — ${quantity} kg`;


    /* Best harbour */

    document.getElementById("bestHarbourName")
        .textContent =
        best.name;


    /* Price */

    document.getElementById("bestPrice")
        .textContent =
        `₹${best.price.toLocaleString("en-IN")}`;


    /* Income */

    document.getElementById("totalIncome")
        .textContent =
        `₹${Math.round(best.netIncome).toLocaleString("en-IN")}`;


    /* AI reason */

    document.getElementById("bestReason")
        .textContent =
        `₹${best.price}/kg • ${best.distance.toFixed(1)} km தொலைவில்`;


    document.getElementById("aiExplanation")
        .textContent =
        `${best.name} துறைமுகத்தில் ₹${best.price}/kg விலை கிடைக்கிறது. ` +
        `உங்கள் இருப்பிடத்திலிருந்து ${best.distance.toFixed(1)} km தூரத்தில் உள்ளது. ` +
        `விலை மற்றும் மதிப்பிடப்பட்ட பயணச் செலவை ஒப்பிட்டு இந்த துறைமுகம் பரிந்துரைக்கப்பட்டுள்ளது.`;


    renderHarbourList();


    goToStep(3);

}


/* -----------------------------
   HARBOUR COMPARISON
----------------------------- */

function renderHarbourList() {

    const container =
        document.getElementById("harbourList");


    container.innerHTML = "";


    recommendationResults.forEach(
        (harbour, index) => {

            const isBest = index === 0;


            const card =
                document.createElement("div");


            card.className =
                `harbour-card ${isBest ? "best" : ""}`;


            card.innerHTML = `

                <div class="harbour-rank">
                    ${isBest ? "🏆" : `#${index + 1}`}
                </div>

                <div class="harbour-info">

                    <h4>
                        ${harbour.name}
                    </h4>

                    <p>
                        📍 ${harbour.distance.toFixed(1)} km
                        &nbsp; • &nbsp;
                        🚚 செலவு ₹${Math.round(harbour.travelCost)}
                    </p>

                </div>

                <div class="harbour-price">

                    <strong>
                        ₹${harbour.price}
                    </strong>

                    <span>
                        / கிலோ
                    </span>

                </div>
            `;


            container.appendChild(card);

        }
    );

}


/* -----------------------------
   OPEN MAP
----------------------------- */

function openMap() {

    const best =
        recommendationResults[0];


    const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${best.lat},${best.lon}`;


    window.open(url, "_blank");

}


/* -----------------------------
   TEXT TO SPEECH
----------------------------- */

function speakRecommendation() {

    if (!("speechSynthesis" in window)) {

        alert(
            "இந்த சாதனத்தில் குரல் வசதி கிடைக்கவில்லை."
        );

        return;
    }


    const best =
        recommendationResults[0];


    const quantity =
        Number(document.getElementById("quantity").value);


    const text =
        `உங்கள் ${quantity} கிலோ ${selectedFish.name} மீனை ` +
        `${best.name} கொண்டு செல்ல பரிந்துரைக்கிறோம். ` +
        `அங்கு ஒரு கிலோவுக்கு ${best.price} ரூபாய் விலை கிடைக்கிறது. ` +
        `உங்கள் மதிப்பிடப்பட்ட வருமானம் ${Math.round(best.netIncome)} ரூபாய்.`;


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang = "ta-IN";

    speech.rate = 0.9;

    speech.pitch = 1;


    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);

}


/* -----------------------------
   RESTART
----------------------------- */

function restartApp() {

    selectedFish = null;

    userLocation = null;

    recommendationResults = [];


    document.querySelectorAll(".fish-card")
        .forEach(card => {
            card.classList.remove("selected");
        });


    document.getElementById("nextToQuantity")
        .disabled = true;


    document.getElementById("quantity")
        .value = 50;


    document.getElementById("locationText")
        .textContent =
        "இருப்பிடம் பெறப்படவில்லை";


    document.getElementById("locationMessage")
        .textContent =
        "அருகிலுள்ள துறைமுகங்களை கண்டுபிடிக்க உங்கள் இருப்பிடம் தேவை.";


    document.getElementById("locationButton")
        .textContent =
        "இருப்பிடத்தைப் பெறு";


    goToStep(1);

}