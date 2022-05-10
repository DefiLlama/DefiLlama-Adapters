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

//Optimism Synths to Mainnet Synths
const L2toL1Synths = {
  '0xe405de8f52ba7559f9df3c368500b6e6ae6cee49': '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb',
  '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9': '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
  '0x298b9b95708152ff6968aafd889c6586e9169f1d': '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6',
  '0xc5db22719a06418028a40a9b5e9a7c02959d0d08': '0xbbc455cb4f1b9e4bfc4b73970d360c8f032efee6'
}

// Converts optimism Synth address into corresponding mainnet Synth address
// Address is in format "network:address"
function getL1SynthAddressFromL2SynthAddress( l2 ){
  return "ethereum:" + L2toL1Synths[l2.split(":")[1].toLowerCase()];
}

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
  
  // Count these as balances
  const tokens_balances_pairs = collat_or_underlying_reordered.map((collat, idx) => [
    transform(collat.output), 
    BigNumber(totalFunds[idx].output).plus(BigNumber(pendingDeposits[idx].output)).plus(BigNumber(premiumCollected[idx].output)).toFixed(0)
  ])
  
  // Cnovert token_balances_pairs to object and aggregate similar tokens
  var balances ={};
  tokens_balances_pairs.forEach( e => {
    let mainnetTokenAddress = getL1SynthAddressFromL2SynthAddress(e[0]);
    if( balances.hasOwnProperty(mainnetTokenAddress) ){
      balances[mainnetTokenAddress] = BigNumber(balances[mainnetTokenAddress]).plus( BigNumber(e[1]) ).toFixed(0);
    } else{
      balances[mainnetTokenAddress] = e[1];
    }
  })

  return balances
}


module.exports = {
  optimism: {
    tvl,
  },
  methodology: 'Using contract methods, TVL is pendingDeposits + totalFunds + premiumCollected and the asset is UNDERLYING or COLLATERAL (put vs call) ',
}
