const sdk = require('@defillama/sdk')
const abi = require('./abi')
const { getBlock } = require('../helper/getBlock');
const { sumTokens } = require('../helper/unwrapLPs');

const master0vix = '0x8849f1a0cB6b5D6076aB150546EddEe193754F1C'
const oMATIC = '0xE554E874c9c60E45F1Debd479389C76230ae25A8'
const matic = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270' 
const chain = 'polygon'
const transform = t => `polygon:${t}`

async function get0vixUnderlyings(chain, block) {
  const {output: markets} = await sdk.api.abi.call({
    abi: abi['0vix_getAllMarkets'],
    target: master0vix,
    chain,
    block,
  })
  const markets_minus_matic = markets.filter(m => m.toLowerCase() !== oMATIC.toLowerCase() )
  const {output: underlyings} = await sdk.api.abi.multiCall({
    abi: abi['market_underlying'],
    calls: markets_minus_matic.map(m => ({ target: m })),
    chain,
    block,
  })
  return {markets, markets_minus_matic, underlyings}
}
async function tvl (timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, chain, chainBlocks, true);
  const balances = {
    [transform(matic)]: (await sdk.api.eth.getBalance({target: oMATIC, chain, block})).output
  };

  const {underlyings} = await get0vixUnderlyings(chain, block)
  const tokensAndOwners = underlyings.map(u => [u.output, u.input.target])
  await sumTokens(balances, tokensAndOwners, block, chain, transform)

  return balances
}

async function borrowed (timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, chain, chainBlocks, true);

  const {markets_minus_matic, underlyings} = await get0vixUnderlyings(chain, block)
  // Put MATIC underlyings at the end
  underlyings.push({
    input: {target: oMATIC}, 
    output: matic
  })
  markets_minus_matic.push(oMATIC)

  const {output: totalBorrows} = await sdk.api.abi.multiCall({
    abi: abi['market_totalBorrows'],
    calls: markets_minus_matic.map(m => ({ target: m })),
    chain,
    block,
  })
  const balances = Object.fromEntries(totalBorrows.map((borrow, idx) => [transform(underlyings[idx].output), borrow.output]))
  return balances
}

module.exports = {
  polygon: {
    tvl, 
    borrowed
  },
  methodology: 'Count balance of erc20 underlying of each market, plus matic balance of the oMATIC market',
}