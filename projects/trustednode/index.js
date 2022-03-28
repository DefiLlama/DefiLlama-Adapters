const sdk = require('@defillama/sdk')
const { getChainTransform } = require('../helper/portedTokens')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const bn = require("bn.js")

const bscVaults = [
    {
        name: "TNODE VAULT",
        chain: "bsc",
        vaultAddr: "0x98386F210af731ECbeE7cbbA12C47A8E65bC8856",
        contractAddr: "0x7f12a37b6921ffac11fab16338b3ae67ee0c462b",
        isLp: false,
    },
    {
        name: "BSC LIQUIDITY VAULT TNODE/BUSD",
        chain: "bsc",
        vaultAddr: "0x44dC7FE8e51076De1B9f863138107148b441853C",
        contractAddr: "0x562C0c707984D40b98cCba889C6847DE274E5d57",
        isLp: true,
    },
]

const fantomVaults = [
    {
        name: "FTM LIQUIDITY VAULT TNODE/USDC",
        chain: "fantom",
        vaultAddr: "0xe056aba40572f64d98a8c8e717c34e96056c4aad",
        contractAddr: "0x9206444A1820c508FbA5bF815713451Ee540B3c8",
        isLp: true,
    },
]

async function vaultTvl(timesatamp, block, chainBlocks, vaults) {
    const balances = {}

    for (const vault of vaults) {
        const totalSupply = (await sdk.api.abi.call({
            abi: 'erc20:totalSupply',
            chain: vault.chain,
            target: vault.vaultAddr,
            params: [],
            block: chainBlocks[vault.chain],
        })).output;

        const transform = await getChainTransform(vault.chain)
        await sdk.util.sumSingleBalance(balances, transform(vault.contractAddr), totalSupply)
    }

    const lpBalances = {}
    for (const lpVault of vaults.filter(vault => vault.isLp)) {
        const transform = await getChainTransform(lpVault.chain)
        const lpPositions = [{
            token: lpVault.contractAddr,
            balance: balances[transform(lpVault.contractAddr)]
        }]
        await unwrapUniswapLPs(lpBalances, lpPositions, block, lpVault.chain, transform)
    }

    for (const key of Object.keys(balances)) {
        if (lpBalances[key]) {
            const balance = new bn(balances[key], 10)
            const lpBalance = new bn(lpBalances[key], 10)
            balances[key] = balance.add(lpBalance).toString()
        }
    }

    for (const key of Object.keys(lpBalances)) {
        if (!balances[key]) {
            balances[key] = lpBalances[key]
        }
    }

    return balances;
}

async function bscTvl(timestamp, block, chainBlocks) {
    return await vaultTvl(timestamp, block, chainBlocks, bscVaults)
}

async function fantomTVL(timestamp, block, chainBlocks) {
    return await vaultTvl(timestamp, block, chainBlocks, fantomVaults)
}

module.exports = {
    bsc: {
        tvl: bscTvl
    },
    fantom: {
        tvl: fantomTVL
    },
};
