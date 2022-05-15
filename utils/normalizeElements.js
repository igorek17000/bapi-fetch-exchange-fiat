const remapFn = ({ adv: { price, tradeMethods } }) => ({ exchangePrice: price, bank: tradeMethods[0].identifier })

const normalizeElements = (input, exclude = [], short = { start: 0, end: 0 }) => input
    .map(remapFn)
    .filter(bank => !exclude.includes(bank))
    .splice(short.start, short.end)
    .reduce((acc, item, index) => acc += `${index + 1} : ${item.bank}: ${item.exchangePrice} \n`, '')

module.exports = {
    normalizeElements
}