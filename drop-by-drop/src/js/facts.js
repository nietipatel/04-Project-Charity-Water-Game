// This file manages the random charity: water facts and triggers a popup every 30 seconds during gameplay.

const facts = [
    "Did you know that 785 million people lack access to clean water?",
    "Every $1 invested in water and sanitation provides a return of $4 in increased productivity.",
    "Water-related diseases claim the lives of more than 3.5 million people each year.",
    "Women and girls are responsible for collecting water in 80% of households without access to safe water.",
    "Access to clean water can reduce the risk of disease and improve health outcomes.",
    "In many developing countries, children miss school due to water-related illnesses.",
    "Charity: water has funded over 64,000 water projects in 29 countries.",
    "Every day, nearly 1,000 children die due to preventable water and sanitation-related diseases."
];

// Function to display a random fact
function displayRandomFact() {
    const randomIndex = Math.floor(Math.random() * facts.length);
    const fact = facts[randomIndex];
    alert(fact); // Display the fact in a popup
}

// Function to start the fact popup timer
function startFactPopupTimer() {
    setInterval(displayRandomFact, 30000); // Trigger every 30 seconds
}

// Export the functions for use in other modules
export { startFactPopupTimer };