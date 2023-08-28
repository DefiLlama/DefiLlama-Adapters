const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const {usdtAddress} = require("../helper/balances");
const { get } = require('../helper/http')

const USDT_DECIMALS = 6;

const ARBITRUM = {
  vaults: ['0xb5AAa74CbA960D9Cbb6beE05e5435299308C682c'],
};
const AVALANCHE = {
  vaults: ['0x3B8Cfb57A87a091A90b5a3c00dF0F6EA0a371Ef7'],
};
const ETHEREUM = {
  vaults: ['0x0bCB75D9c5d4D33EE36bFeAfa94F8b75080b4387'],
}

function chainTvl(chain, config) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];

    let chainBalance = 0;

    const wants = [];
    const coins = [];

    for (const vault of config.vaults) {

      const want = (await sdk.api.abi.call({
        block,
        target: vault,
        abi: abi.want,
        chain,
      })).output;

      wants.push(want)
      coins.push(`${chain}:${want}`.toLowerCase());
    }

    const getCoins = get(`https://coins.llama.fi/prices/current/${coins.join(',')}`)

    const coinsData = (await getCoins).coins;

    for (let index = 0; index < config.vaults.length; index++) {
      const vault = config.vaults[index];
      const want = wants[index];

      const vaultBalance = (await sdk.api.abi.call({
        block,
        target: vault,
        abi: abi.balance,
        chain,
      })).output;

      const coinId = `${chain}:${want}`.toLowerCase();

      const coinDecimals = coinsData[coinId].decimals;
      const coinPrice = coinsData[coinId].price;

      const divisor = coinDecimals === USDT_DECIMALS ? 1 : 10 ** (coinDecimals - USDT_DECIMALS);

      chainBalance += vaultBalance * (coinPrice / divisor)
    }

    return {
      [usdtAddress]: chainBalance
    };
  };
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  arbitrum: {
    tvl: chainTvl('arbitrum', ARBITRUM),
  },
  avax: {
    tvl: chainTvl('avax', AVALANCHE),
  },
  ethereum: {
    tvl: chainTvl('ethereum', ETHEREUM),
  },
  hallmarks: [
    [1677200400, "Vaults deprecated"]
  ]
};
