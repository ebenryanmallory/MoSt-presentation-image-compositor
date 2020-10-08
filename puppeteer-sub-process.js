const puppeteer = require('puppeteer');
const crypto = require("crypto");

const uid = crypto.randomBytes(16).toString("hex");

async function process(request) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(request.body.url, {waitUntil: 'networkidle2'});
    await page.setViewport({
        width: 800,
        height: 1000,
      });
    await page.screenshot({
        path:`public/temp/${uid}upper.jpg`
    });
    await page.evaluate(async () => {
        window.scrollBy(0, 800);
    });
    await page.screenshot({
        path:`public/temp/${uid}lower.jpg`
    });
    imageURLSnaphostScript = `
        document.querySelector('img#upper').src = "../temp/${uid}upper.jpg";
        document.querySelector('img#lower').src = "../temp/${uid}lower.jpg";
    `;
    return imageURLSnaphostScript;
}

exports.process = process;