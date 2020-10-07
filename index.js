const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

// Fire up our API and backend framework
const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json())
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
    themeScript = themeScript.concat(`
        document.querySelector('.background').style.background = "${request.body.color}";
    `)
    await page.evaluate(javascript => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = javascript;
        script.setAttribute("id", "script");
        document.body.parentElement.appendChild(script);
    }, themeScript);
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
        path:`public/temp/result.png`,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: Math.min(boundingBox.width, page.viewport().width),
            height: Math.min(boundingBox.height, page.viewport().height),
          }
    });
    // Sends encoded version back to the website
    response.send(screenShot);
    browser.close();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App running - listening on port ${PORT}`);
});