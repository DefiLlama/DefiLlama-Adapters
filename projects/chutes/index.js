import { ApiPromise, WsProvider } from "@polkadot/api";
import '@polkadot/api-augment';

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

async function tvl() {
    const wsProvider = new WsProvider('wss://entrypoint-finney.opentensor.ai:443');
    const api = await ApiPromise.create({ provider: wsProvider });
    
    const resultTao = await api.query.subtensorModule.subnetTAO(64)
    const taoIn = resultTao.toJSON()

    const resultAlpha = await api.query.subtensorModule.subnetAlphaIn(64)
    const alphaIn = resultAlpha.toJSON()

    const tvl = // taoIn*taousd price + alphaIn*alphaUSD price


    console.log(taoIn / 1e9) // result in tao, tao/usd price accessible on CG
    console.log(alphaIn / 1e9) // result in alpha (sn64), sn64/usd price accessible on CG
    return tvl
}

module.exports = {
  methodology: 'counts the number of TAO/alpha tokens of the uni V2 pool.',
  bittensor: {
    tvl,
  }
};