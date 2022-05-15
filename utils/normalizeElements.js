const normalizeElements = (input, exclude = [], short = { start: 0, end: 0 }) => input
    .filter(({ adv: { tradeMethods } }) => tradeMethods[0].identifier.incdlues(exclude))
    .map(({ adv: { price, tradeMethods } }) => ({ exchangePrice: price, bank: tradeMethods[0].identifier }))
    .splice(short.start, short.end)

module.export = {
    normalizeElements
}