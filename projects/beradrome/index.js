const sdk = require('@defillama/sdk');

const ADDRESSES = require('../helper/coreAssets.json')

const { inferProtocol } = require('./helper')
const { updateBerpsVaultTvl } = require('./berps')
const { updateBalancerV2Tvl } = require('./balancerV2')
const { updateKodiakUniV2Tvl } = require('./kodiakUniV2')
const { updateKodiakVaultTvl } = require('./kodiakVault')
const { updateBeraborrowTvl } = require('./beraborrow')


const BERO = "0x7838CEc5B11298Ff6a9513Fa385621B765C74174";
const hiBERO = "0x7F0976b52F6c1ddcD4d6f639537C97DE22fa2b69";
const VOTER = "0xd7ea36ECA1cA3E73bC262A6D05DB01E60AE4AD47"

async function staking(api) {
    const bal = await api.call({ abi: 'erc20:balanceOf', target: BERO, params: hiBERO })
    const price = await api.call({ abi: 'uint256:getMarketPrice', target: BERO })

    api.add(ADDRESSES.berachain.HONEY, bal * price / 1e18)
}

async function borrowed(api) {
    api.add(ADDRESSES.berachain.HONEY, await api.call({ abi: 'uint256:debtTotal', target: BERO }))
}

async function tvl(api) {
    const balances = {};

    const honeyBalance = await api.call({  
        abi: 'erc20:balanceOf',
        target: ADDRESSES.berachain.HONEY,
        params: BERO
    })
    sdk.util.sumSingleBalance(balances, ADDRESSES.berachain.HONEY, honeyBalance, api.chain);

    const plugins = await api.call({ abi: 'address[]:getPlugins', target: VOTER })

    for (const plugin of plugins) {
        const protocol = await api.call({
            abi: 'string:getProtocol',
            target: plugin
        })
        const name = await api.call({
            abi: 'string:getName',
            target: plugin
        })

        const inferredProtocol = inferProtocol(protocol, name)

        if (inferredProtocol === "Unsupported protocol") {
            continue
        }

        if (inferredProtocol === 'Bullas') {
            continue
        }

        if (inferredProtocol === 'Gumball') {
            continue
        }

        if (name === 'Berps bHONEY' || name === 'iBGT') {
            await updateBerpsVaultTvl(api, plugin, balances)
        }

        if (inferredProtocol === 'BeraSwap' || inferredProtocol === 'Infrared') {
            await updateBalancerV2Tvl(api, plugin, balances)
        }

        if (inferredProtocol === 'Kodiak V2') {
            await updateKodiakUniV2Tvl(api, plugin, balances)
        }

        if (inferredProtocol === "Kodiak" ||inferredProtocol === "Kodiak Trifecta" ||inferredProtocol === "Infrared Trifecta Kodiak") {
            await updateKodiakVaultTvl(api, plugin, balances)
        }

        if (inferredProtocol === 'BERPS') {
            await updateBerpsVaultTvl(api, plugin, balances)
        }

        if (inferredProtocol === 'Beraborrow') {
            await updateBeraborrowTvl(api, plugin, balances)
        }
    }

    return balances
}

module.exports = {
    methodology: `Counts the number of locked HONEY in the Beradrome Bonding Curve and deposited liquidity in Beradrome smart contracts. Staking accounts for the BERO locked in hiBERO.`,
    berachain: {
        tvl,
        borrowed, staking,
    },
};

