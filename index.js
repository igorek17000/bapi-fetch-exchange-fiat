#!/usr/bin/node

require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const { getP2PData } = require('./api/binance');
const { normalizeElements, bankBlackList } = require('./utils/normalizeElements');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: { interval: 5000 } });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const shortener = 15;
    const fristZalupa = await getP2PData();

    if (fristZalupa && fristZalupa.success) {
        const totalPages = Math.ceil((fristZalupa.total / 20));
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

        const elementsConfigSize = { short: { start: 0, end: shortener } };
        const normalizedElements = normalizeElements(elements, bankBlackList, elementsConfigSize)

        if (normalizedElements) {
            normalizedElements.map(({ exchangePrice, bank }) => bot.sendMessage(chatId, `${exchangePrice} | ${bank}`))
        }
    }
})