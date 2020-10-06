const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

// Fire up our API and backend framework
const app = express();

app.use(cors({ origin: true }));
app.use(express.static(__dirname + '/public'));
// Point to our HTML
app.set('view engine', 'html');

// Serve our static HTML
app.get('/', (request, response) => {
  response.render(`index`);
});

// POST API endpoint
app.post("/composite-image", async (request, response) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = `http://localhost:8000/composite-image-template/`;
    // Todo = url = process.env.BASEURL
    await page.goto(url, {waitUntil: 'networkidle2'});
    let themeScript = ``; // yes, I used backticks. ... Because ... I like backticks...
    await page.evaluate(javascript => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = javascript;
        script.setAttribute("id", "script");
        document.body.parentElement.appendChild(script);
    }, themeScript);
    // Writes the actual file
    const screenShot = await page.screenshot({
        omitBackground: true,
        path:`public/temp/result.png`
    });
    // Sends encoded version back to the website
    await response.send(screenShot);
    await browser.close();
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running - listening on port ${port}`);
});