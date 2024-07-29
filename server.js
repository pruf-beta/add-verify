const express = require('express');
const useragent = require('express-useragent');

const app = express();
const port = 3000;

// Middleware to parse user agent
app.use(useragent.express());

// Route to handle mobile-only access
app.get('/verify', (req, res) => {
    if (req.useragent.isMobile) {
        res.send('This URL is accessible on mobile browsers.');
    } else {
        res.status(403).send('Error: This URL is accessible only on mobile browsers.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
