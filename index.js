const { program } = require('commander');
const { getLinks } = require('./src/pages/home');
const { getArticle, getArticles } = require('./src/pages/article');

program
    .option('-a, --article <link>', 'Get article by link.')
    .option('-r, --articles', 'Get all articles.')
    .option('-l, --links', 'Get articles links.');

program.parse(process.argv);

const run = async () => {
    let result = null;

    if (program.links) {
        const links = await getLinks();
        result = links;

    } else if (program.article) {
        const article = await getArticle(program.article);
        result = article;

    } else if (program.articles) {
        await getArticles();
        result = 'JSON file with articles was generated successfully.';
    }

    console.log(result);
};

run();
