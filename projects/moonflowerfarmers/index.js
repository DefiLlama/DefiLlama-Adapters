const sdk = require("@defillama/sdk");

const contracts = {
    Egg: "0x26df7D109d9c32feDfc1c2C3c87689C4A9cAF388",
    Gold: "0x6CAc30b91c58893ff0efEba288E44b6d53C78734",
    Iron: "0x77375a4fDF1b64C0F9Cc0Cd648c9ef787925DA67",
    Stone: "0x0916f455C897bFd40D8f99C27B08115bE85E420F",
    TokenV2: "0x78B65477bBa78fc11735801D559C386611d07529",
    Wood: "0x3F2c12b2D27749a630a430d7600ACbE7aECb25fb"
}

const transform = (addr) => `aurora:${addr}`;

async function tvl(timestamp, block) {
    return {
        [contracts.Wood]: (await sdk.api.erc20.totalSupply({target: transform(contracts.Wood), block: block['aurora'], chain: 'aurora' })).output,
        [contracts.Stone]: (await sdk.api.erc20.totalSupply({target: transform(contracts.Stone), block: block['aurora'], chain: 'aurora' })).output,
        [contracts.Iron]: (await sdk.api.erc20.totalSupply({target: transform(contracts.Iron), block: block['aurora'], chain: 'aurora' })).output,
        [contracts.Gold]: (await sdk.api.erc20.totalSupply({target: transform(contracts.Gold), block: block['aurora'], chain: 'aurora' })).output,
        [contracts.TokenV2]: (await sdk.api.erc20.totalSupply({target: transform(contracts.TokenV2), block: block['aurora'], chain: 'aurora' })).output,
    };
}

module.exports = {
    misrepresentedTokens: true,
    aurora: {
        tvl,
    },
    tvl,
};