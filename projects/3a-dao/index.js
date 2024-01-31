const ethers = require("ethers");
const EURO3 = require("./EURO3Price");
const protocol = require("./protocolTVL");
const Provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");

module.exports = {
    methodology: 'Counts the total value locked of all the collaterals assets in the protocol.',
    EURO3: {
        totalSupply: EURO3.totalSupply(Provider),
        price: EURO3.price(Provider)
    },
    tvl: protocol.tvl(Provider)
};