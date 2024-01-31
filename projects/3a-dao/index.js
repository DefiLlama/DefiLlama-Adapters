const ethers = require("ethers");
const EURO3 = require("./EURO3Price");
const protocol = require("./protocolTVL");
const Provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");


// Make sure to use async functions and await when necessary
async function test() {
    console.log({
        methodology: 'TVL counts the value for all the collateral tokens stored in the protocol vaults',
        tvl: await protocol.tvl(Provider),
        EURO3: {
            totalSupply: await EURO3.totalSupply(Provider),
            price: await EURO3.price(Provider),
        },
    });
}

test();

module.exports = {
    methodology: 'Calculates the cumulative value of locked collateral across all assets within the protocol.',
    EURO3: {
        totalSupply: EURO3.totalSupply(Provider),
        price: EURO3.price(Provider)
    },
    tvl: protocol.tvl(Provider)
};