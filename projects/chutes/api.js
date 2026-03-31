const { ApiPromise, WsProvider } = require("@polkadot/api");

/**
 * Calculates the Total Value Locked (TVL) for a specific Bittensor subnet.
 * 
 * Queries the Subtensor module to retrieve the amount of TAO and Alpha tokens
 * locked in the specified subnet pool, which can be used to calculate the subnet's TVL
 * by multiplying with their respective USD prices from CoinGecko.
 * 
 * @param subnet - The subnet ID to query (e.g., 64 for the Alpha subnet)
 * @returns The calculated TVL value
 */

const tvl = async (api) => {
    const wsProvider = new WsProvider('wss://entrypoint-finney.opentensor.ai:443');
    const bittensorApi = await ApiPromise.create({ provider: wsProvider });

    const resultTao = await bittensorApi.query.subtensorModule.subnetTAO(64)
    const taoIn = resultTao.toJSON()

    const resultAlpha = await bittensorApi.query.subtensorModule.subnetAlphaIn(64)
    const alphaIn = resultAlpha.toJSON()

    api.addCGToken('bittensor', taoIn / 1e9)
    api.addCGToken('chutes', alphaIn / 1e9)
}

module.exports = {
    methodology: 'counts the number of TAO/alpha tokens of the uni V2 pool.',
    bittensor: {
        tvl,
    }
};