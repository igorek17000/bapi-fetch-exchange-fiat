require('dotenv').config()
const BAKNK_BLACK_LIST = ['Wise'];
const POLLING_INTERVAL = 5000;
const MAX_LIST_SIZE = 15;
const ELEMENTS_PER_PAGE = 20;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

module.exports = {
    BAKNK_BLACK_LIST,
    POLLING_INTERVAL,
    MAX_LIST_SIZE,
    ELEMENTS_PER_PAGE,
    TELEGRAM_TOKEN
}