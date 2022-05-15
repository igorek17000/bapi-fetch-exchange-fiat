const https = require("https");

const host = 'p2p.binance.com'
const search = `/bapi/c2c/v2/friendly/c2c/adv/search`

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

module.exports = {
    getP2PData
}
