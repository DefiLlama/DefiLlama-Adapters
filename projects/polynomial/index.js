const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const { getBlock } = require('../helper/getBlock')
const abi = require('./abi.json')
const chain = 'optimism'
const transform = t => `${chain}:${t}`

// Polynomial contract addresses
const polynomial_contracts = [
  '0xfa923aa6b4df5bea456df37fa044b37f0fddcdb4', 
  '0x331cf6e3e59b18a8bc776a0f652af9e2b42781c5',
  '0xea48dD74BA1Ff41B705ba5Cf993B2D558e12D860',
  '0x23CB080dd0ECCdacbEB0BEb2a769215280B5087D'
]

async function tvl (timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, chain, chainBlocks, false)

  // Get if contract type is Put or Call - so that we can distinguish between calling the UNDERLYING or COLLATERAL read function
  const {output: contractNames} = await sdk.api.abi.multiCall({
    abi: abi['name'],
    calls: polynomial_contracts.map(p => ({ target: p })),
    chain, block,
  })
  const contractTypeisPut = contractNames.map((name => name.output.indexOf('Put') !== -1)) 
  const [{output: collaterals}, {output: underlyings}] = await Promise.all( [
    sdk.api.abi.multiCall({
      abi: abi['polynomial_COLLATERAL'],
      calls: polynomial_contracts.filter((c,i) => contractTypeisPut[i]).map(p => ({ target: p })),
      chain, block,
    }), 
    sdk.api.abi.multiCall({
      abi: abi['polynomial_UNDERLYING'],
      calls: polynomial_contracts.filter((c,i) => !contractTypeisPut[i]).map(p => ({ target: p })),
      chain, block,
    }), 
  ])
  const collat_or_underlying_unordered = [collaterals, underlyings].flat()
  const collat_or_underlying_reordered = polynomial_contracts.map(contract => 
    collat_or_underlying_unordered.find(cu => cu.input.target === contract))

  // Get pendingDeposits, totalFunds, premiumCollected
  const [{output: pendingDeposits}, {output: totalFunds}, {output: premiumCollected}] = await Promise.all( [
    sdk.api.abi.multiCall({
      abi: abi['polynomial_pendingDeposits'],
      calls: polynomial_contracts.map(p => ({ target: p })),
      chain, block,
    }), 
    sdk.api.abi.multiCall({
      abi: abi['polynomial_totalFunds'],
      calls: polynomial_contracts.map(p => ({ target: p })),
      chain, block,
    }), 
    sdk.api.abi.multiCall({
      abi: abi['polynomial_premiumCollected'],
      calls: polynomial_contracts.map(p => ({ target: p })),
      chain, block,
    })
  ]) 
  // console.log(pendingDeposits, totalFunds, premiumCollected, collat_or_underlying_reordered)

  // Count these as balances
  const tokens_balances_pairs = collat_or_underlying_reordered.map((collat, idx) => [
    transform(collat.output), 
    BigNumber(totalFunds[idx].output).plus(BigNumber(pendingDeposits[idx].output)).plus(BigNumber(premiumCollected[idx].output)).toFixed(0)
  ])
  const balances = Object.fromEntries(tokens_balances_pairs)
  return balances
}


module.exports = {
  optimism: {
    tvl,
  },
  methodology: 'Using contract methods, TVL is pendingDeposits + totalFunds + premiumCollected and the asset is UNDERLYING or COLLATERAL (put vs call) ',
}
