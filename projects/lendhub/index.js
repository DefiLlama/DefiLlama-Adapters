const ADDRESSES = require('../helper/coreAssets.json')

const sdk = require('@defillama/sdk');
const cAbis = require('./abi.json');
const { getChainTransform } = require('../helper/portedTokens')
const { unwrapLPsAuto } = require('../helper/unwrapLPs')

const comptroller = "0x6537d6307ca40231939985BCF7D83096Dd1B4C09";
const chain = "heco";

async function getAllCTokens(block) {
  return (await sdk.api.abi.call({
    block,
    chain,
    target: comptroller,
    abi: cAbis['getAllMarkets'],
  })).output;
}

async function getMarkets(block) {
  let allCTokens = await getAllCTokens(block);
  const markets = []
  const calls = []
  for (const cToken of allCTokens) {
    if (cToken.toLowerCase() === '0x99a2114B282acC9dd25804782ACb4D3a2b1Ad215'.toLowerCase())
      markets.push({ cToken, underlying: ADDRESSES.heco.WHT })
    else
      calls.push({ target: cToken })
  }
  const { output: underlyings } = await sdk.api.abi.multiCall({
    abi: cAbis['underlying'],
    calls,
    chain, block,
  })
  underlyings.forEach(({ output, input }) => markets.push({ cToken: input.target, underlying: output.toLowerCase() }))
  return markets;
}

function tvl(borrowed) {
  return async (_, _b, { [chain]: block }) => {
    let balances = {};
    let markets = await getMarkets(block)
    const transformAddress = await getChainTransform(chain)
    let { output: cashInfo} = await sdk.api.abi.multiCall({
      calls: markets.map((market) => ({
        target: market.cToken,
      })),
      chain, block,
      abi: borrowed ? cAbis.totalBorrows : cAbis['getCash'],
      requery: true,
    })

    const { output: symbols } = await sdk.api.abi.multiCall({
      calls: markets.map((market) => ({
        target: market.underlying,
      })),
      chain, block,
      abi: "erc20:symbol",
    })

    const symbolCalls = symbols.filter(({ output }) => output.toLowerCase().includes('lfHMDX'.toLowerCase())).map(i => ({ target: i.input.target }))
    const { output: sTransform } = await sdk.api.abi.multiCall({
      abi: cAbis['valtToken'],
      calls: symbolCalls,
      chain, block,
    });

    const transformMapping = {}
    sTransform.forEach(i => transformMapping[i.input.target] = i.output)
    markets.forEach(({ underlying}, idx) => {
      const balance = cashInfo[idx].output
      let label = transformAddress(transformMapping[underlying] ? transformMapping[underlying] : underlying)
      sdk.util.sumSingleBalance(balances, label, balance)
    })

    await unwrapLPsAuto({ balances, block, chain, transformAddress, })
    return balances;
  }
}

module.exports = {
  timetravel: false,
  hallmarks: [
    [Math.floor(new Date('2023-01-12')/1e3), 'Protocol was hacked'],
  ],
  heco: {
    tvl: tvl(false),
    // borrowed: tvl(true),
    borrowed: () => 0,
  }
};