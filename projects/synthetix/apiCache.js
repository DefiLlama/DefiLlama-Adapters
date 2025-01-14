const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require('bignumber.js');
const abi = require('./abi.json');
const { getBlock } = require('../helper/http');
const { requery } = require('../helper/requery');
const { sliceIntoChunks, } = require('../helper/utils');
const { getCache, setCache } = require('../helper/cache');
const { request, gql } = require("graphql-request");
const project = 'bulky/synthetix'
const { log } = require('../helper/utils')

const QUERY_NO_BLOCK = gql`
query manyHolders($lastID: String, $block: Int) {
  holders(first: 1000, where: {
    id_gt: $lastID
  }){
    id
  }
}
`

const synthetixStates = {
  ethereum: '0x4b9Ca5607f1fF8019c1C6A3c2f0CC8de622D5B82',
  optimism: '0x8377b25B8564f6Be579865639776c5082CB37163' // It's Issuer, not SynthetixState but has the same issuanceRatio function
}
const synthetixs = {
  ethereum: ADDRESSES.ethereum.SNX,
  optimism: '0x8700daec35af8ff88c16bdf0418774cb3d7599b4'
}
const snxGraphEndpoints = {
  ethereum: sdk.graph.modifyEndpoint('2chLKUMdvBJEbrceCdvCF8VGB1xQ3Ytbyujj9Rw3WyKY'),
  optimism: sdk.graph.modifyEndpoint('5NQi9n4ztd8M6EEDFKA6gwcCnbLdmzZRymiDbPkbjEWN')
}
const ethStaking = "0xc1aae9d18bbe386b102435a8632c8063d31e747c"
const weth = ADDRESSES.ethereum.WETH

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks)
    const synthetixState = synthetixStates[chain]
    const synthetix = synthetixs[chain]
    const snxGraphEndpoint = snxGraphEndpoints[chain]
    let totalTopStakersSNXLocked = new BigNumber(0);
    let totalTopStakersSNX = new BigNumber(0);

    const holdersAll = sliceIntoChunks(await SNXHolders(snxGraphEndpoint, block, chain), 500)
    log('holders count: ', holdersAll.flat().length, chain)

    const issuanceRatio = (await sdk.api.abi.call({
      block,
      chain,
      target: synthetixState,
      abi: abi['issuanceRatio']
    })).output;

    let i = 0

    for (const holders of holdersAll) {
      log('fetching %s of %s', ++i, holdersAll.length)

      const calls = holders.map(holder => ({ target: synthetix, params: holder }))
      const [ratio, collateral] = await Promise.all([
        sdk.api.abi.multiCall({
          block,
          chain,
          abi: abi['collateralisationRatio'],
          calls,
        }),
        sdk.api.abi.multiCall({
          block,
          chain,
          abi: abi['collateral'],
          calls,
        })
      ])
      
      await requery(ratio, chain, block, abi['collateralisationRatio'])
      await requery(collateral, chain, block, abi['collateral'])
      const ratios = {}
      ratio.output.forEach(r => ratios[r.input.params[0]] = r.output)
      const collaterals = {}
      collateral.output.forEach(r => collaterals[r.input.params[0]] = r.output)

      holders.forEach((holder) => {
        let _collateral = collaterals[holder];
        let _ratio = ratios[holder];
        if (_collateral === null || _ratio === null) {
          throw new Error(`Failed request for collateral/ratio of holder ${holder}`)
        }
        let locked = _collateral * Math.min(1, _ratio / issuanceRatio);
        totalTopStakersSNX = totalTopStakersSNX.plus(_collateral)
        totalTopStakersSNXLocked = totalTopStakersSNXLocked.plus(locked);
      });
    }

    const percentLocked = totalTopStakersSNXLocked.div(totalTopStakersSNX);
    const unformattedSnxTotalSupply = (await sdk.api.abi.call({
      block,
      chain,
      target: synthetix,
      abi: abi['totalSupply']
    })).output;

    //log(unformattedSnxTotalSupply, new BigNumber(unformattedSnxTotalSupply).div(Math.pow(10, 18)))
    const snxTotalSupply = parseInt(new BigNumber(unformattedSnxTotalSupply).div(Math.pow(10, 18)));
    const totalSNXLocked = percentLocked.times(snxTotalSupply);

    const balances = {
      [synthetixs.ethereum]: totalSNXLocked.times(Math.pow(10, 18)).toFixed(0),
    }
    if (chain === "ethereum") {
      const ethStaked = await sdk.api.erc20.balanceOf({
        target: weth,
        owner: ethStaking,
        block
      })
      balances[weth] = ethStaked.output
    }

    return balances;
  }
}

// Uses graph protocol to run through SNX contract. Since there is a limit of 1000 results per query
// we can use graph-results-pager library to increase the limit.
async function SNXHolders(snxGraphEndpoint, block, chain) {
  const cache = await getCache(project, chain)
  if (!cache.data) cache.data = []
  let holders = new Set(cache.data)
  let lastID = cache.lastID || ""
  let holdersPage;
  let i = 0
  do {
    log(chain, ++i, 'current last Id', lastID)
    holdersPage = (await request(snxGraphEndpoint, QUERY_NO_BLOCK, {
      block,
      lastID
    })).holders
    holdersPage = holdersPage.map(i => i.id)
    cache.data.push(...holdersPage)
    holdersPage.forEach(h => holders.add(h))
    lastID = holdersPage[holdersPage.length - 1]
    if (lastID) cache.lastID = lastID
  } while (lastID);
  cache.data = Array.from(holders)
  await setCache(project, chain, cache)
  return cache.data
}

module.exports = {
  start: '2019-08-08',  // Fri Aug 09 2019 00:00:00
  optimism: {
    tvl: chainTvl("optimism")
  },
  ethereum: {
    tvl: chainTvl("ethereum"),
  },
};
