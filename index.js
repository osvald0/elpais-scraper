const fs = require('fs');
const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.elpais.com.uy';
const CONFIG = { headless: true };
const UNSUPPORTED_SECTIONS = ['especiales'];

const getLinks = async () => {
    const browser = await puppeteer.launch(CONFIG);

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

const getArticle = async (path) => {
    const PAGE_URL = path.includes('elpais.com.uy') ? path : `${BASE_URL}/${path}`;
    const browser = await puppeteer.launch(CONFIG);

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
        const article = await getArticle(link);
        articles.push(article);
    }

    console.log('# of Articles: ', articles.length);

    const result = { date: new Date(), articles };

    fs.writeFileSync('article.json', JSON.stringify(result));
    console.log('Finish: ', new Date);
};

const run = async () => {
    const args = process.argv;

    if (args.length > 2) {
        const url = args[2].split('--article=');
        if (url.length > 0) {
            const article = await getArticle(url[1]);
            console.log(article);
        } else {
            console.log('Sorry, the argument is not supported :(');
        }
    } else {
        await getArticles();
    }
};

run();
