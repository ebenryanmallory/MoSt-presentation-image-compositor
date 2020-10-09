const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const subProcessor = require('./puppeteer-sub-process.js')

// Fire up our API and backend framework
const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
// Point to our HTML
app.use(express.static(__dirname + '/public'));
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
    const url = `${request.body.windowLocation}/composite-image-template/`;
    // Todo = url = process.env.BASEURL
    await page.goto(url, {waitUntil: 'networkidle2'});
    let themeScript = ``; // yes, I used backticks. ... Because ... I like backticks...
    themeScript = themeScript.concat(`
        document.querySelector('.background').style.background = "${request.body.color}";
    `)
    if (request.body.url) {
        imageURLSnaphostScript = await subProcessor.process(request);
        themeScript = themeScript.concat(imageURLSnaphostScript);
    }
    if (request.body.leftFile) {
        themeScript = themeScript.concat(`
            document.querySelector('img#upper').src = "${request.body.leftFile}";
        `)
    }
    if (request.body.rightFile) {
        themeScript = themeScript.concat(`
            document.querySelector('img#lower').src = "${request.body.rightFile}";
        `)
    }
    await page.evaluate(javascript => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = javascript;
        script.setAttribute("id", "script");
        document.body.parentElement.appendChild(script);
    }, themeScript);
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    // Extra time padding for remote images to load in
    await sleep(1000);
    await page.setViewport({
        width: 800,
        height: 1000,
      });
    const background = await page.$('.background');
    const boundingBox = await background.boundingBox();
    // Writes the actual file
    const screenShot = await page.screenshot({
        // We can use png transparency around the edges since we will have a rounded border
        omitBackground: true,
        // Write the file on the server
        path:`public/temp/result.png`,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: Math.min(boundingBox.width, page.viewport().width),
            height: Math.min(boundingBox.height, page.viewport().height),
          }
    });
    // Send encoded version back to the website
    response.send(screenShot);
    browser.close();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});