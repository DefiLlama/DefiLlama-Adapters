const { sumTokens } = require('../helper/unwrapLPs')
const addresses = require('./contracts.json')
const { transformFantomAddress } = require("../helper/portedTokens");
const sdk = require('@defillama/sdk');
const staking = require('../helper/staking');

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
        let transformed = transformAddress(k);
        if(k.toLowerCase() === tokens.xBOO.toLowerCase()){
            transformed = "fantom:0x841fad6eae12c286d1fd18d1d525dffa75c7effe"
        }
        delete Object.assign(balances, {[transformed]: balances[k] })[k];
    });
    return balances;
}

const MASTERCHEF = "0x1719ab3C1518eB28d570a1E52980Dbc137B12e66"

// node test.js projects/shadecash/index.js
module.exports = {
    fantom:{
        tvl,
    },
    staking:{
        tvl: staking(MASTERCHEF, tokens.SHADE, 'fantom', 'fantom:'+tokens.SHADE)
    },
    tvl,
 }