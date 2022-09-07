const express = require("express");
const router = express.Router();

const { scrapData } = require("./scraper.controller");

// Routes
router.post("/hackerrank-leaderboard", scrapData);

module.exports = router;
