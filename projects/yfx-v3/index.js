const sdk = require('@defillama/sdk');
const {staking} = require('../helper/staking')
const { transformArbitrumAddress } = require('../helper/portedTokens');

const manager = '0x29bd0372A8A087e4d34d4098259Cd298d554BAc4';
const vault = '0x48F4B8f77b1E0EFBBF17b2082F12829b87FD1933';
const yfxTracker = '';
const yfxToken = '0x569deb225441FD18BdE18aED53E2EC7Eb4e10D93';

async function tvl(timestamp, block, chainBlocks) {
    let pools = await sdk.api.abi.call({
        block: chainBlocks.arbitrum,
        target: manager,
        abi: "function getAllPools() view returns (address[])",
        chain: 'arbitrum'
    });

    pools = pools.output;
    if (pools.length == 0) return 0;

    const transform = await transformArbitrumAddress();

    // let tvlUsd = 0;
    let balances = {};
    for (let pool in pools) {
        let token = (await sdk.api.abi.call({
            block: chainBlocks.arbitrum,
            target: manager,
            params: pools[pool],
            abi: "function getPoolBaseAsset(address pool) view returns(address)",
            chain: 'arbitrum'
        })).output;

        // let decimal = await sdk.api.erc20.decimals(token, "arbitrum");

        

        let collateralBalance = (await sdk.api.abi.call({
            block: chainBlocks.arbitrum,
            target: vault,
            params: [pools[pool], token],
            abi: "function poolBalances(address pool, address token) view returns(uint256)",
            chain: 'arbitrum'
        })).output;

        sdk.util.sumSingleBalance(balances, transform(token), collateralBalance)

        // if (balances["arbitrum:"+token] == undefined ||  balances["arbitrum:"+token] == null)  balances["arbitrum:"+token] = parseInt(tvls); // / (10 ** decimal.output);
        // else balances["arbitrum:"+token] += parseInt(tvls); // / (10 ** decimal.output);

        // if (stableToken[token.toLocaleLowerCase()]) {
        //     tvlUsd += tvls / (10**decimal);
        // }
        // else {
        //     let symbol = (await sdk.api.erc20.symbol(token, "arbitrum")).output;
        //     if (symbol == "WETH") symbol = "ETH";

        //     let price = (await sdk.api.abi.call({
        //         block: chainBlocks.arbitrum,
        //         target: priceFeed,
        //         params: symbol+"_USD",
        //         abi: "function getLatestPrimaryPrice(string _token) view returns (uint256)",
        //         chain: 'arbitrum'
        //     })).output;

        //     tvlUsd += tvls.output / (10**decimal.output) * price / 1e10;
        // }

    }
    // console.log(balances);
    // console.log(tvlUsd);
    return balances;
}

module.exports = {
    methodology: 'Count balance of each pool from the Vault',
    arbitrum: {
      tvl,
      // staking: staking(yfxTracker, yfxToken, "arbitrum", "yfx", 18),
    },
}