const TelegramBot = require('node-telegram-bot-api');
const { getP2PData } = require('../api/binance');
const { normalizeElements } = require('../utils/normalizeElements');
const { POLLING_INTERVAL, BANK_BLACK_LIST, MAX_LIST_SIZE, ELEMENTS_PER_PAGE, TELEGRAM_TOKEN } = require('../utils/constants');

const initiate = () => {
    const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: { interval: POLLING_INTERVAL } });

    bot.onText(/^\/start$/, async (msg) => {
        const chatId = msg.chat.id;

        setInterval(async () => {
            const firstPage = await getP2PData();

            if (firstPage && firstPage.success) {
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
                    const elementsConfigSize = { start: 0, end: MAX_LIST_SIZE };
                    const normalizedElements = normalizeElements(elements, BANK_BLACK_LIST, elementsConfigSize)

                    bot.sendMessage(chatId, normalizedElements)
                }
            }
        }, POLLING_INTERVAL);
    });
}

module.exports = {
    initiate
}