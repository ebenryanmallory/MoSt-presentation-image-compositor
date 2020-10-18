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
        headless: true
    });
    const page = await browser.newPage();
    const templateURL = `${request.body.windowLocation}/composite-image-template/`;
    if (process.env.BASEURL) {
        templateURL = `${process.env.BASEURL}/composite-image-template/`;
    }
    await page.goto(templateURL, {waitUntil: 'networkidle2'});
    let injectedPageScript = ``;
    injectedPageScript = injectedPageScript.concat(`
        document.querySelector('.background').style.background = "${request.body.color}";
    `)
    // User experience consideration: image uploads will override a snapshot URL
    // If user has gone to the trouble of uploading an image, it gets priority
    // UI is simplified as no confirmation or settings are created, although this is based on assumption
    if (request.body.url) {
        imageURLSnaphostScript = await subProcessor.process(request);
        injectedPageScript = injectedPageScript.concat(imageURLSnaphostScript);
    }
    if (request.body.leftFile) {
        injectedPageScript = injectedPageScript.concat(`
            document.querySelector('img#upper').src = "${request.body.leftFile}";
        `)
    }
    if (request.body.rightFile) {
        injectedPageScript = injectedPageScript.concat(`
            document.querySelector('img#lower').src = "${request.body.rightFile}";
        `)
    }
    await page.evaluate(javascript => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = javascript;
        script.setAttribute("id", "script");
        document.body.parentElement.appendChild(script);
    }, injectedPageScript);
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    // Extra time padding for remote images to load in [ TODO: poll image load completion ]
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
        // Write the file on the server side into the static assets folder
        path:`public/temp/result.png`,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: Math.min(boundingBox.width, page.viewport().width),
            height: Math.min(boundingBox.height, page.viewport().height),
          }
    });
    await page.screenshot({
        // Repeat and write JPEG version of file (won't have transparency around edges)
        path:`public/temp/result.jpg`,
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