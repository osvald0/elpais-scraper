const puppeteer = require('puppeteer');
const config = require('../config');
const { BASE_URL, UNSUPPORTED_SECTIONS } = require('../constants');

const getLinks = async () => {
    const browser = await puppeteer.launch(config);

    try {
        const page = await browser.newPage();

        await page.goto(BASE_URL);
        await page.evaluate('document.documentElement.webkitRequestFullscreen()');
        await page.waitForSelector('.default-menu');

        const links = await page.evaluate(
            () => Array.from(
                document.querySelectorAll('[class="page-link"]'),
                a => a.getAttribute('href')
            )
        );

        const supportedLinks = links.filter((link) =>
            !UNSUPPORTED_SECTIONS.includes(link.split('/')[1])
        );

        return Array.from(new Set(supportedLinks));

    } catch (error) {
        console.log(error);

    } finally {
        await browser.close();
    }
};

module.exports = {
    getLinks,
};
