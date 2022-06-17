const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs")
const { get } = require("../helper/http")
const { default: BigNumber } = require('bignumber.js')

const NEAR_TOKEN = "0x85f17cf997934a597031b2e18a9ab6ebd4b9f6a4"
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

async function addEthBalances(addresses, block, balances) {
    await Promise.all(addresses.map(async (target) => {
        const ethBalance = (
            await sdk.api.eth.getBalance({
                target,
                block,
            })
        ).output;

        sdk.util.sumSingleBalance(
            balances,
            WETH,
            ethBalance
        )
    }))
}

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const data = await get("https://data.ondo.finance/v1/addresses")
    const partner_tokens = data["supported_tokens"]
    const ondo_multisigs = data["ondo_multisigs"]
    const ondo_lps = data["ondo_lps"]

    await addEthBalances(ondo_multisigs, block, balances)

    const tokens = [
        ...partner_tokens.map(i => [i, false]),
        ...ondo_lps.map(i => [i, true]),
    ];

    await sumTokensAndLPsSharedOwners(
        balances,
        tokens,
        ondo_multisigs,
        block,
    );

    if (balances[NEAR_TOKEN]) {
        balances.near = BigNumber(balances[NEAR_TOKEN]).dividedBy(10 ** 24).toFixed(0)
        delete balances[NEAR_TOKEN]
    }

    return balances;
}

async function tvlForAllPairs(timestamp, block, chainBlocks) {
    const data = await get("https://data.ondo.finance/v1/addresses")
    const ondoAllPairVaults = data["ondo_all_pair_vaults"]
    let vaults = await Promise.all(ondoAllPairVaults.map( async (allPairVault) => {
        const vaults = (await sdk.api.abi.call({
            target: allPairVault,
            block,
            abi: abi.getVaults,
            params: [0, 9999] // It cuts at max length
        })).output
        return vaults
    }))
    vaults = vaults.flat()
    const balances = {}
    for (const vault of vaults) {
        if (timestamp > Number(vault.startAt) && timestamp < Number(vault.redeemAt)) {
            vault.assets.forEach(asset => {
                sdk.util.sumSingleBalance(balances, asset.token, asset.deposited)
            })
        }
    }
    return balances
}

module.exports = {
    methodology: "Counts all tokens in deployed vaults as well as Ondo's LaaS multi-sigs",
    ethereum: {
        tvl: sdk.util.sumChainTvls([tvlForAllPairs, tvl])
    },
}

