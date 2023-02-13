
const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const ZYBER = "0x3B475F6f2f41853706afc9Fa6a6b8C5dF1a2724c";

const stableSwapPools = {
    '3pool': {
        name: '3pool',
        address: '0x969f7699fbB9C79d8B61315630CDeED95977Cfb8',
        assets: ['USDC', 'USDT', 'DAI'],
        lpToken: '3pool'
    },
}

const stableSwapTokens = {
    USDC: {
        address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
        decimals: 6,
        symbol: 'USDC',
        gecko: 'usd-coin'
    },
    USDT: {
        address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        decimals: 6,
        symbol: 'USDT',
        gecko: 'tether'
    },
    DAI: {
        address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
        decimals: 18,
        symbol: 'DAI',
        gecko: 'dai'
    }
}

async function stableDexTVL(timestamp, _block, chainBlocks) {
    const block = chainBlocks.arbitrum
    let balances = {};
    let calls = [];

    for (const pool of Object.values(stableSwapPools)) {
        for (const token of pool.assets)
            if (stableSwapTokens[token]) {
                calls.push({
                    target: stableSwapTokens[token].address,
                    params: pool.address,
                });
            }
    }

    // Pool Balances
    let balanceOfResults = await sdk.api.abi.multiCall({
        block,
        calls: calls,
        abi: "erc20:balanceOf",
        chain: 'arbitrum'
    });

    // Compute Balances
    balanceOfResults.output.forEach((balanceOf) => {
        let address = balanceOf.input.target;
        let amount = balanceOf.output;
        amount = BigNumber(amount).toFixed();
        balances[address] = BigNumber(balances[address] || 0)
            .plus(amount)
            .toFixed();
    });


    const finalBalances = {}
    for (const tokenAddress in balances) {
        const asset = Object.values(stableSwapTokens).find(r => r.address.toLowerCase() == tokenAddress.toLowerCase());
        sdk.util.sumSingleBalance(finalBalances, asset.gecko, (balances[tokenAddress]) / (10 ** asset.decimals))
    }

    return finalBalances;
}
const dexTVL = getUniTVL({ factory: '0xaC2ee06A14c52570Ef3B9812Ed240BCe359772e7', fetchBalances: true, useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0xaC2ee06A14c52570Ef3B9812Ed240BCe359772e7) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $ZYB staking, StableSwap, Earn and Vaults.`,
    arbitrum: {
        tvl: sdk.util.sumChainTvls([dexTVL, stableDexTVL]),
        staking: sumTokensExport({
            owners: ['0xEFf77E179f6abb49a5bf0EC25c920B495e110C3b', '0x9BA666165867E916Ee7Ed3a3aE6C19415C2fBDDD', '0x9CB8Ed8102B6c65D8CAE931394352d7a676ce12a'],
            tokens: [ZYBER],
        })
    }
};


