const sdk = require('@defillama/sdk')
const { getChainTransform } = require('../helper/portedTokens')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const bn = require("bn.js")

const bscVaults = [
    {
        name: "BSC LIQUIDITY VAULT TNODE/BUSD",
        chain: "bsc",
        vaultAddr: "0x44dC7FE8e51076De1B9f863138107148b441853C",
        contractAddr: "0x562C0c707984D40b98cCba889C6847DE274E5d57",
        isLp: true,
    },
    {
        name: "TNODE VAULT",
        chain: "bsc",
        vaultAddr: "0x98386F210af731ECbeE7cbbA12C47A8E65bC8856",
        contractAddr: "0x7f12a37b6921ffac11fab16338b3ae67ee0c462b",
        isLp: false,
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
function vault(vault) {
    return async (timestamp, block, chainBlocks) => {
        const balances = {}

        const totalSupply = (await sdk.api.abi.call({
            abi: 'erc20:totalSupply',
            chain: vault.chain,
            target: vault.vaultAddr,
            params: [],
            block: chainBlocks[vault.chain],
        })).output;

        const transform = await getChainTransform(vault.chain)
        await sdk.util.sumSingleBalance(balances, transform(vault.contractAddr), totalSupply)


        const lpBalances = {}
        if (vault.isLp) {
            const transform = await getChainTransform(vault.chain)
            const lpPositions = [{
                token: vault.contractAddr,
                balance: balances[transform(vault.contractAddr)]
            }]
            await unwrapUniswapLPs(lpBalances, lpPositions, block, vault.chain, transform)
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
}



module.exports = {
    bsc: {
        tvl: () => ({}),
        pool2: vault(bscVaults[0]),
        staking: vault(bscVaults[1])
    },
    fantom: {
        tvl: () => ({}),
        pool2: vault(fantomVaults[0])
    },
};
// node test.js projects/trustednode/index.js