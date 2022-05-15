require('dotenv').config()
const BANK_BLACK_LIST = ['Wise'];
const POLLING_INTERVAL = process.env.POLLING_INTERVAL;
const MAX_LIST_SIZE = 5;
const ELEMENTS_PER_PAGE = 20;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

module.exports = {
    BANK_BLACK_LIST,
    POLLING_INTERVAL,
    MAX_LIST_SIZE,
    ELEMENTS_PER_PAGE,
    TELEGRAM_TOKEN
}