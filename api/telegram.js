const TelegramBot = require('node-telegram-bot-api');
const { getP2PData } = require('../api/binance');
const { normalizeElements, getValue } = require('../utils/normalizeElements');
const { BANK_BLACK_LIST, MAX_LIST_SIZE, ELEMENTS_PER_PAGE, TELEGRAM_TOKEN, POLLING_INTERVAL } = require('../utils/constants');
const { formatDate } = require('../utils/time');
const plotly = require('plotly')("eliaslebed", "noy9Hpoa6ZBRejpMJrRl")
const fs = require('fs');

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const imgOpts = {
    format: 'jpeg',
    width: 1000,
    height: 1000
};

const writeStream = fs.createWriteStream('data.txt');
fs.createWriteStream('1.jpeg')

const initiate = () => {
    bot.onText(/^\/start$/, async (msg) => {
        const poll = (promiseFn, time) =>
            promiseFn().then(async (firstPage) => {
                if (firstPage && firstPage.success) {
                    const chatId = msg.chat.id;
                    const totalPages = Math.ceil((firstPage.total / ELEMENTS_PER_PAGE));
                    const pages = new Array(totalPages - 1).fill(null);
                    const elements = await pages.reduce(async (prev, _, idx) => {
                        const accData = await prev;
                        const page = idx + 2;

                        const result = await getP2PData(page)

                        if (result && result.success) {
                            return [...accData, ...result.data]
                        }

                        return accData;
                    }, Promise.resolve(firstPage.data))

                    if (elements) {
                        const elementsConfigSize = { start: 0, end: 1 };
                        const normalizedElements = normalizeElements(elements, BANK_BLACK_LIST, elementsConfigSize)
                        const value = getValue(elements, BANK_BLACK_LIST);
                        const allFileContents = fs.readFileSync('data.txt', 'utf-8');
                        const data = { x: [], y: [] }

                        writeStream.write(`${value[0]}, ${formatDate(new Date())}\n`);

                        allFileContents.split(/\r?\n/).forEach(line => {
                            const [x, y] = line.split(',')

                            if (!x && !y) {
                                return
                            }

                            data.x.push(x)
                            data.y.push(y)
                        });

                        const trace1 = {
                            x: data.y.map(y => y.trim()),
                            y: data.x.map(x => parseFloat(x)),
                            type: "scatter"
                        };

                        const figure = { 'data': [trace1] }

                        plotly.getImage(figure, imgOpts, function (error, imageStream) {
                            if (error) return console.log(error);

                            const fileStream = fs.createWriteStream('1.jpeg');

                            imageStream.pipe(fileStream)
                        });

                        const buffer = fs.readFileSync('1.jpeg');
                        bot.sendPhoto(chatId, buffer, {}, { filename: '1.jpeg' });
                        bot.sendMessage(chatId, normalizedElements)
                    }
                }

                return sleep(time).then(() => poll(promiseFn, time))
            })

        poll(getP2PData, POLLING_INTERVAL);

    });
}

module.exports = {
    initiate
}