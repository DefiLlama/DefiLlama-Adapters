const sdk = require('@defillama/sdk');
const addresses = require("./addresses.json");
const BigNumber = require("bignumber.js");

const ampl = "0xD46bA6D942050d489DBd938a2C909A5d5039A161";
const amplVault = "0x805c7Ecba41f9321bb098ec1cf31d86d9407de2F"

function getTvl(chain) {
    return async (timestamp, _block, chainBlocks) => {
        const json = addresses[chain];
        const target = json.ERC20Handler;
        const block = chainBlocks[chain];
        // console.log(json);
        const balances = {
            [json.Wrapped]:
                (await sdk.api.eth.getBalance({ target, chain: chain })).output
        };
        if (chain == "ethereum") {
            sdk.util.sumSingleBalance(balances, ampl, (await sdk.api.abi.call({
                target: ampl,
                params: amplVault,
                abi: 'erc20:balanceOf',
                block: block,
                chain: chain
            })).output)
        }
        const holdTokens = await sdk.api.abi.multiCall({
            calls: json.Tokens.map(token => ({
                target: token,
                params: [target]
            })),
            abi: 'erc20:balanceOf',
            chain: chain
        })
        sdk.util.sumMultiBalanceOf(balances, holdTokens, true);

        Object.entries(balances).forEach(([token, value]) => {
            let newKey
            if (token.startsWith("0x")) newKey = `${chain}:${token}`
            else if (!token.includes(':')) newKey = `coingecko:${token}`
            if (newKey) {
                delete balances[token]
                sdk.util.sumSingleBalance(balances, newKey, BigNumber(value).toFixed(0))
            }
        })
        return balances;
    }

}
module.exports = {
    ethereum: {
        tvl: getTvl('ethereum'),
    },
    // bsc: {
    //     tvl: getTvl('bsc'),
    // },
    // moonriver: {
    //     tvl: getTvl('moonriver'),
    // },
    // meter: {
    //     tvl: getTvl('meter'),
    // },
    // theta: {
    //     tvl: getTvl('theta'),
    // },
    // avax: {
    //     tvl: getTvl('avax'),
    // },
    // moonbeam: {
    //     tvl: getTvl('moonbeam'),
    // },
    // polygon: {
    //     tvl: getTvl('polygon'),
    // }
}; 