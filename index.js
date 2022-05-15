#!/usr/bin/node

require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const https = require("https");
const { host, search } = require('./api/binance');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: { interval: 5000 } });

const getP2PData = (page = 1, fiat = 'UAH', tradeType = 'BUY', asset = 'USDT', payTypes = []) => {
    return new Promise((resolve, reject) => {
        const obj = {
            page,
            rows: 20,
            payTypes,
            publisherType: null,
            asset,
            tradeType,
            fiat,
        };
        const objToString = JSON.stringify(obj);
        const options = {
            method: 'POST',
            part: 443,
            hostname: host,
            path: search,
            headers: { 'Content-Type': 'application/json', 'Content-Length': objToString.length },
            body: JSON.stringify(objToString)
        }
        const req = https.request(options, (res) => {
            let output = "";

            res.on('data', d => {
                output += d;
            })

            res.on('end', () => {
                try {
                    const jsonOutput = JSON.parse(output);
                    resolve(jsonOutput);
                } catch (error) {
                    reject('Error: ', error);
                }
            })
        })


        req.on("error", (error) => {
            reject(error);
        });

        req.write(objToString);
        req.end();
    })
}

(async function () {
    await bot.startPolling({ polling: { interval: 10000 } });
    console.log("Bot started!");
})();

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const divider = 15;
    const fristZalupa = await getP2PData();

    console.log('???????????????')

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

        const data = elements
            .filter(item => item.adv.tradeMethods[0].identifier !== 'Wise')
            .map(item => ({ exchangePrice: item.adv.price, bank: item.adv.tradeMethods[0].identifier }))

        console.log('data', data)

        if (data) {
            data.splice(0, divider).map(({ exchangePrice, bank }) => bot.sendMessage(chatId, `${exchangePrice} | ${bank}`))
        }
    }
})