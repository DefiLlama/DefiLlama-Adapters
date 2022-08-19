const sdk = require('@defillama/sdk');
const abis = require('/home/wizgot/projects/DefiLlama-Adapters/projects/config/cache-gold/abis.js')
const { toUSDTBalances } = require('../helper/balances');

  async function tvl(timestamp, block) {
    const balances = {};

    const cgt = '0xf5238462e7235c7b62811567e63dd17d12c2eaa0';
    const chainLinkGoldGramConvertorPriceConsumer = '0x34BCe86EEf8516282FEE6B5FD19824163C2B5914';

    const circulatingBalance = (await sdk.api.abi.call({
      block,
      target: cgt,
      abi: abis.abis.cacheGold.find(i => i.name === 'totalCirculation')
    })).output;

    const chainlinkAuGramPrice = (await sdk.api.abi.call({
      block,
      target: chainLinkGoldGramConvertorPriceConsumer,
      abi: abis.abis.gramOz.find(i => i.name === 'getLatestPrice')
    })).output;

  return toUSDTBalances(circulatingBalance*chainlinkAuGramPrice/10**16);
  }

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Counts the number of tokens in circulation times the chainlink USD price in grams',
  ethereum: {
    tvl,
  },
  start: 1617235200
}; 
