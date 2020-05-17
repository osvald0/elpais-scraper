const fs = require('fs');
const puppeteer = require('puppeteer');
const config = require('../config');
const { BASE_URL } = require('../constants');
const { getLinks } = require('./home');

const getArticle = async (path) => {
    const PAGE_URL = path.includes('elpais.com.uy') ? path : `${BASE_URL}/${path}`;
    const browser = await puppeteer.launch(config);

    try {
        const page = await browser.newPage();

        await page.goto(PAGE_URL, { timeout: 60000 });
        await page.evaluate('document.documentElement.webkitRequestFullscreen()');
        await page.waitForSelector('[class="hamburger-menu-icon"]', { timeout: 3000 });

        const article = await page.evaluate(() => {
            const title = document.querySelector('h1.title').textContent;
            const subtitle = document.querySelector('h2.epigraph').textContent;
            const image = document.querySelector('[class="article-content"] figure img').getAttribute('src');
            const paragraphs = document.querySelectorAll('.paragraph');
            let content = [];

            for (const paragraph of paragraphs) {
                const currentContent = paragraph.textContent;
                content.push(currentContent);
            }

            return { title, subtitle, image, content };
        });

        return article;

    } catch (error) {
        console.log('The article link provided is invalid.');
        console.log('Link: ', PAGE_URL);

    } finally {
        await browser.close();
    }
};

const getArticles = async () => {
    console.log('Start: ', new Date);

    const links = await getLinks();
    console.log('# of Links: ', links.length);

    let articles = [];

    for (const link of links) {
        console.log('Get article: ', link);
        const article = await getArticle(link);
        articles.push(article);
    }

    console.log('# of Articles: ', articles.length);

    const result = { date: new Date(), articles };

    fs.writeFileSync('articles.json', JSON.stringify(result));
    console.log('Finish: ', new Date);
};

module.exports = {
    getArticle,
    getArticles,
};
