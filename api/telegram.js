const TelegramBot = require('node-telegram-bot-api');
const { getP2PData } = require('./api/binance');
const { normalizeElements } = require('./utils/normalizeElements');
const { POLLING_INTERVAL, BAKNK_BLACK_LIST, MAX_LIST_SIZE, ELEMENTS_PER_PAGE, TELEGRAM_TOKEN } = require('./utils/constants');

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: { interval: POLLING_INTERVAL } });

const initiate = () => {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const fristZalupa = await getP2PData();

        if (fristZalupa && fristZalupa.success) {
            const totalPages = Math.ceil((fristZalupa.total / ELEMENTS_PER_PAGE));
            const pages = new Array(totalPages - 1).fill(null);
            const elements = await pages.reduce(async (prev, _, idx) => {
                const accData = await prev;
                const page = idx + 2;

                const result = await getP2PData(page)

                if (result && result.success) {
                    return [...accData, ...result.data]
                }

                return accData;
            }, Promise.resolve(fristZalupa.data))

            const elementsConfigSize = { short: { start: 0, end: MAX_LIST_SIZE } };
            const normalizedElements = normalizeElements(elements, BAKNK_BLACK_LIST, elementsConfigSize)

            if (normalizedElements) {
                normalizedElements.map(({ exchangePrice, bank }) => bot.sendMessage(chatId, `${exchangePrice} | ${bank}`))
            }
        }
    })

}

module.exports = {
    initiate
}