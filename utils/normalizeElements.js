const remapFn = ({ adv: { price, tradeMethods, dynamicMaxSingleTransAmount, tradableQuantity, fiatSymbol } }) => ({
  exchangePrice: price,
  bank: tradeMethods[0].identifier,
  amount: dynamicMaxSingleTransAmount,
  quantity: tradableQuantity, fiatSymbol
})

const normalizeElements = (input, exclude = [], short = { start: 0, end: 0 }) => input
  .map(remapFn)
  .filter(({ bank }) => !exclude.includes(bank))
  .splice(short.start, short.end)
  .reduce((acc, item, index) => acc += `${index + 1} : ${item.bank}: ${item.exchangePrice} | $${item.quantity} => ${item.fiatSymbol}${item.amount}  \n`, '')

module.exports = {
  normalizeElements
}