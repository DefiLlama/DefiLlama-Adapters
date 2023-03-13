const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const BigNumber = require('bignumber.js');
const { lendingMarket } = require('../helper/methodologies')


// ask comptroller for all markets array
async function getAllPTokens(block, chainBlocks) {
  return (await sdk.api.abi.call({
    block: chainBlocks['polygon'],
    target: '0x1eDf64B621F17dc45c82a65E1312E8df988A94D3', // unitroller
    params: [],
    abi: abi['getAllMarkets'],
    chain: 'polygon'
  })).output;
}


async function getMarkets(block, chainBlocks) {
    
    const markets = []

    const allPTokens = await getAllPTokens(block, chainBlocks)
    const calls = allPTokens.map(i => ({ target: i }))

    const { output } = await sdk.api.abi.multiCall({
      abi: abi['underlying'], 
      calls, 
      block: chainBlocks['polygon'],
      chain: 'polygon'
    });
    output.forEach(({ input: { target: pToken }, output: underlying}) => markets.push({ pToken, underlying, }))
    return markets;
}

async function vTvl(balances, block, chainBlocks) {
  
    let markets = await getMarkets(block, chainBlocks);
  
    // Get tokens locked
    let v2Locked = await sdk.api.abi.multiCall({
      block: chainBlocks['polygon'],
      calls: markets.map((market) => ({
        target: market.pToken,
      })),
      abi: abi['getCash'],
      chain: 'polygon'
    });

  
    markets.forEach((market) => {
      let getCash = v2Locked.output.find((result) => result.input.target === market.pToken);
      balances['polygon:' + market.underlying] = BigNumber(balances['polygon:' + market.underlying] || 0).plus(getCash.output).toFixed();
    });
    return balances;
}


async function tvl(block, chainBlocks) {
    let balances = {};

    await vTvl(balances, block, chainBlocks);
    
    return balances;
}

module.exports = {

    timetravel: true,
    polygon: {
      tvl
    },
    methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses.`,
};
  