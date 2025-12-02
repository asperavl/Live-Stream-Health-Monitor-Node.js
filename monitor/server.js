const express = require("express");
const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    next();
});


let health = {
    segment: "-",
    time: "-",
    age: "-",
    state: "unknown"
};

app.get("/health", (req, res) => {
    res.json(health);
});

app.listen(8081, () => {
    console.log("Health API running on http://localhost:8081/health");
});

module.exports = {
    updateHealth(obj) {
        health = obj;
    }
};
