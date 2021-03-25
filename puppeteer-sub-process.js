const puppeteer = require('puppeteer');
const crypto = require("crypto");

const uid = crypto.randomBytes(16).toString("hex");

async function process(request) {
    console.log('launching subprocess puppeteer')
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto(request.body.url, {waitUntil: 'networkidle0'});
    await page.setViewport({
        width: 961,
        height: 1100,
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