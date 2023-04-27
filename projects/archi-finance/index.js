const sdk = require("@defillama/sdk");
const BN = require("bignumber.js");
const balances = require("../helper/balances");
const abi = require("./abi.json");

const aggregator = `0xeD36E66ad87dE148A908e8a51b78888553D87E16`;
const collateralReward = "0xbd198617aD1dc75B0f7A0A67BbE31993919Cd716";
const vaults = [
    // weth pool
    "0x7674Ccf6cAE51F20d376644C42cd69EC7d4324f4",
    // usdt pool
    "0x179bD8d1d654DB8aa1603f232E284FF8d53a0688",
    // usdc pool
    "0xa7490e0828Ed39DF886b9032ebBF98851193D79c",
    // wbtc pool
    "0xee54A31e9759B0F7FDbF48221b72CD9F3aEA00AB",
    // dai pool
    "0x4262BA30d5c1bba98e9E9fc3c40602a7E09Ca49F",
    // link pool
    "0xB86a783C329d5D0CE84093757586F5Fd5364cd71",
    // uni pool
    "0xAf2a336AE86eF90a3958F4bFC6EFc23cD6190951",
    // frax pool
    "0x2032998a5312B88f6b4d2b86638Be31B20d1B573",
    // mim pool
    "0xbd70E8712264D6A62a7A6BD255A59992068adCAd"
];

const tvl = async () => {
    let usdPrice = new BN(0);

    const supplyRewardPools = (await sdk.api.abi.multiCall({
        chain: "arbitrum",
        abi: abi["supplyRewardPool"],
        params: [],
        calls: vaults.map((target, _) => {
            return {
                target: target
            }
        })
    })).output.map(result => result.output);

    const borrowedRewardPool = (await sdk.api.abi.multiCall({
        chain: "arbitrum",
        abi: abi["borrowedRewardPool"],
        params: [],
        calls: vaults.map((target, _) => {
            return {
                target: target
            }
        })
    })).output.map(result => result.output);

    const supplyPoollSupplies = (await sdk.api.abi.multiCall({
        chain: "arbitrum",
        abi: 'uint256:totalSupply',
        calls: supplyRewardPools.map((target, _) => {
            return {
                target: target
            }
        })
    })).output.map(result => result.output);

    const borrowedPoolSupplies = (await sdk.api.abi.multiCall({
        chain: "arbitrum",
        abi: 'uint256:totalSupply',
        calls: borrowedRewardPool.map((target, _) => {
            return {
                target: target
            }
        })
    })).output.map(result => result.output);

    for (const idx in vaults) {
        const vsTokens = new BN(supplyPoollSupplies[idx]).plus(new BN(borrowedPoolSupplies[idx]));

        if (vsTokens.eq(0)) continue;

        const underlyingToken = await sdk.api.abi.call({
            chain: "arbitrum",
            target: vaults[idx],
            abi: "address:underlyingToken",
        }).then(result => result.output);

        const decimals = await sdk.api.abi.call({
            chain: "arbitrum",
            target: underlyingToken,
            abi: "uint256:decimals",
        }).then(result => result.output);


        const tokenPrice = await sdk.api.abi.call({
            chain: "arbitrum",
            target: aggregator,
            abi: abi["getTokenPrice"],
            params: [underlyingToken],
        }).then(result => result.output);

        usdPrice = usdPrice.plus(vsTokens.multipliedBy(new BN(tokenPrice).dividedBy(10 ** 30)).dividedBy(10 ** decimals));
    }

    const collateralRewardSupply = await sdk.api.abi.call({
        chain: "arbitrum",
        target: collateralReward,
        abi: 'uint256:totalSupply',
        params: [],
    }).then(result => result.output);

    const glpPrice = await sdk.api.abi.call({
        chain: "arbitrum",
        target: aggregator,
        abi: abi["getGlpPrice"],
        params: [false],
    }).then(result => result.output);

    usdPrice = usdPrice.plus(new BN(collateralRewardSupply).multipliedBy(new BN(glpPrice).dividedBy(10 ** 30)).dividedBy(10 ** 18));

    return balances.toUSDTBalances(usdPrice);
}

module.exports = {
    methodology: "The TVL (Total Value Locked) of ArchiFinance is calculated by adding the total liquidity and borrowing amount.",
    timetravel: true,
    misrepresentedTokens: true,
    arbitrum: {
        tvl
    },
};