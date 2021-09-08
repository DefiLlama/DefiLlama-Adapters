const { sumTokens } = require('../helper/unwrapLPs')
const addresses = require('./contracts.json')
const { transformFantomAddress } = require("../helper/portedTokens");
const sdk = require('@defillama/sdk');

const tokens = {
    "USDC": "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    "xBOO": "0xa48d959AE2E88f1dAA7D5F611E01908106dE7598",
    "SHADE": "0x3A3841f5fa9f2c283EA567d5Aeea3Af022dD2262"
};

async function tvl(_, _ethBlock, chainBlocks) {
    let balances = {
        "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83": 0
      }
    let calls = [];

    // GET FTM BALANCES
    for (let [k, address] of Object.entries(addresses)) {
        await sdk.api.eth.getBalance({
            target: address, 
            block: chainBlocks['fantom'],
            chain: "fantom"
        }).then(b => {
            balances["0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"] = 
                Number(b.output) + 
                Number(balances["0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"]);
        });
    };
    // GET ERC20 BALANCES
    Object.entries(addresses).map(([,address]) => {
        Object.entries(tokens).map(([,token]) => {
            calls.push([token, address]);
        });
    });
    await sumTokens(balances, calls, chainBlocks['fantom'], chain = "fantom");

    // TRANSFORM ADDRESSES
    let transformAddress = await transformFantomAddress();
    Object.keys(balances).map(k => {
        const transformed = transformAddress(k);
        delete Object.assign(balances, {[transformed]: balances[k] })[k];
    });
    return balances;
}

// node test.js projects/shadecash/index.js
module.exports = {
    fantom:{
        tvl,
    },
    tvl,
 }