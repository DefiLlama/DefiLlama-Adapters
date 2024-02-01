const ethers = require("ethers");
const EURO3 = require("./EURO3Price");
const protocol = require("./protocolTVL");
const Provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");


module.exports = {
    methodology: 'Calculates the cumulative value of locked collateral across all assets within the protocol.',
    polygon: {
        tvl: protocol.tvl(Provider),
        ownTokens: {
            EURO3: {
                totalSupply: EURO3.totalSupply(Provider),
                price: EURO3.price(Provider)
            },
        },
    }
};