const express = require('express');
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const ipapi = require('ipapi.co');

const app = express();
const port = 3000;

// Middleware to parse user agent and client IP
app.use(useragent.express());
app.use(requestIp.mw());

// Sample email to pin code mapping
const emailToPinCodeMap = {
    'user1@example.com': 'Mumbai',
    'user2@example.com': 'Pune',
    'user3@example.com': 'Mumbai',
};

// Middleware to check if the request is from a mobile browser
const mobileOnlyMiddleware = (req, res, next) => {
    if (!req.useragent.isMobile) {
        return res.status(403).send('Error: This URL is accessible only on mobile browsers.');
    }
    next();
};

// Middleware to check if the IP's location matches the pin code associated with the email
const geoFenceMiddleware = (req, res, next) => {
    const email = req.query.email;
    const userCity = emailToPinCodeMap[email];

    if (!userCity) {
        return res.status(403).send('Error: Email not associated with any allowed city.');
    }

    const clientIp = req.clientIp;
    console.log("clientIP ", clientIp);
    const geo = geoip.lookup(clientIp);

    console.log("geo ", geo);
    if (!geo) {
        return res.status(403).send('Error: Unable to determine location from IP.');
    }

    //const userLocationPinCode = geo.zip;
    const userLocationCity = geo.city;
    console.log("userLocationCity ", userLocationCity);
    if (userCity == userLocationCity) {
        return res.status(201).send('Great to see you in ', userLocationCity);
    }
    else {
        return res.status(403).send('Error: This URL is accessible only within the allowed city area. You are accessing this URL from ', userLocationCity);
    }
    next();
};

// Route to handle mobile-only and geo-fenced access
app.get('/verify', mobileOnlyMiddleware, geoFenceMiddleware, (req, res) => {
    res.send('This URL is accessible on mobile browsers within the allowed city area.');
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
