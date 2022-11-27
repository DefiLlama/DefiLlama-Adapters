const sdk = require('@defillama/sdk');
const addresses = require("./addresses.json");
const BigNumber = require("bignumber.js");


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
        // console.log("balances:",balances,chain)
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
    bsc: {
        tvl: getTvl('bsc'),
    },
    moonriver: {
        tvl: getTvl('moonriver'),
    },
    meter: {
        tvl: getTvl('meter'),
    },
    theta: {
        tvl: getTvl('theta'),
    }
}; 