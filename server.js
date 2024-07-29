const express = require('express');
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');

const app = express();
const port = 3000;

// Middleware to parse user agent and client IP
app.use(useragent.express());
app.use(requestIp.mw());

// Sample email to pin code mapping
const emailToPinCodeMap = {
    'user1@example.com': '110001',
    'user2@example.com': '110002',
    'user3@example.com': '110003',
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
    const userPinCode = emailToPinCodeMap[email];

    if (!userPinCode) {
        return res.status(403).send('Error: Email not associated with any allowed pin code.');
    }

    const clientIp = req.clientIp;
    const geo = geoip.lookup(clientIp);

    if (!geo) {
        return res.status(403).send('Error: Unable to determine location from IP.');
    }

    const userLocationPinCode = geo.zip;
    if (userPinCode !== userLocationPinCode) {
        return res.status(403).send('Error: This URL is accessible only within the allowed pin code area.');
    }
    next();
};

// Route to handle mobile-only and geo-fenced access
app.get('/mobile-only', mobileOnlyMiddleware, geoFenceMiddleware, (req, res) => {
    res.send('This URL is accessible on mobile browsers within the allowed pin code area.');
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
