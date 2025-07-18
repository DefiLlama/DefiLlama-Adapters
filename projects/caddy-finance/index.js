/**
 * Caddy Finance is a bitcoin yield vault that allows users to earn yield on their bitcoin holdings.
 */ 

const {multiCall} = require("../helper/chain/starknet");
const ADDRESSES = require('../helper/coreAssets.json');
const { wBTCVaultAbiMap } = require('./wBTCVaultABIMap');

const wBTCDATA = [{
    address: "0x015630e959b03b07442e4bf6d078d3915fac58866e003c8153f2c2caa2c1cfc2", // address of BTC vault contract
    token: ADDRESSES.starknet.WBTC
}]

// returns the tvl
async function tvl(api) {
    const totalAssets = await multiCall({
        calls: wBTCDATA.map(c => c.address),
        abi: wBTCVaultAbiMap,
        chain: 'starknet',
    });

    api.addTokens(wBTCDATA.map(c => c.token), totalAssets);
}

module.exports = {
    doublecounted: true,
    methodology: "The TVL is in BTC",
    starknet: {
        tvl,
    },
};