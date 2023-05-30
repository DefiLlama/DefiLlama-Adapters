const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const contracts = {
    "xWeowns": "0xaBA0Bb586335B938a7a817A900017D891268d32c",
    "USDT": "0x32D2b9bBCf25525b8D7E92CBAB14Ca1a5f347B14",
    "USDTethereum": ADDRESSES.ethereum.USDT
};

async function tvl(timestamp, block, chainBlocks) {
    return {
        [ contracts.USDTethereum ]:
        (await sdk.api.abi.call({
            target: contracts.USDT,
            params: contracts.xWeowns,
            abi: 'erc20:balanceOf',
            block: chainBlocks.lachain,
            chain: 'lachain'
        })).output
    };
}

module.exports = {
    doublecounted: false,
    lachain: {
        tvl
    }
};