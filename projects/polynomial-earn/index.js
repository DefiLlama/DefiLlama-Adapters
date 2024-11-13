const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const abi = require('./abi.json')
const abi2 = require('./abi2.json')
const chain = 'optimism'
const { getConfig } = require('../helper/cache')
const transform = t => `${chain}:${t}`

// Polynomial contract addresses
const polynomial_contracts = [
  '0xfa923aa6b4df5bea456df37fa044b37f0fddcdb4', 
  '0x331cf6e3e59b18a8bc776a0f652af9e2b42781c5',
  '0xea48dD74BA1Ff41B705ba5Cf993B2D558e12D860',
  '0x23CB080dd0ECCdacbEB0BEb2a769215280B5087D'
]

const MAINNET_SETH = '0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb'

//Optimism Synths to Mainnet Synths
const L2toL1Synths = {
  [ADDRESSES.optimism.sETH]: MAINNET_SETH,
  [ADDRESSES.optimism.sUSD]: ADDRESSES.ethereum.sUSD,
  '0x298b9b95708152ff6968aafd889c6586e9169f1d': '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6',
  '0xc5db22719a06418028a40a9b5e9a7c02959d0d08': '0xbbc455cb4f1b9e4bfc4b73970d360c8f032efee6'
}

const contractL1Synths = {
  // sEth Call Selling
  '0x53268e841E30278EF0B9597813893fA8e4559510': MAINNET_SETH,
  // sETH Put Selling
  '0xa11451ACD2Fbdf4Ae798F44c4227cAB9517739d7': ADDRESSES.ethereum.sUSD,
  // ETH PUT SELLING
  '0xb28Df1b71a5b3a638eCeDf484E0545465a45d2Ec': ADDRESSES.ethereum.sUSD,
  // ETH CALL SELLING
  '0x2D46292cbB3C601c6e2c74C32df3A4FCe99b59C7': MAINNET_SETH,
  // GAMMA
  '0x965e460bF5cb38BadA79fB2293c6304C799D0b1c': ADDRESSES.ethereum.sUSD,
  //ETH CALL SELLING QUOTE
  '0xB7b4270cFD938F4F1C111ac819e7365E8Ce0300a': ADDRESSES.ethereum.sUSD
}


// Converts optimism Synth address into corresponding mainnet Synth address
// Address is in format "network:address"
function getL1SynthAddressFromL2SynthAddress( l2 ){
  return "ethereum:" + L2toL1Synths[l2.split(":")[1].toLowerCase()];
}

async function tvl (timestamp, ethBlock, {[chain]: block}) {

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

  // Convert token_balances_pairs to object and aggregate similar tokens
  var balances ={};
  tokens_balances_pairs.forEach( e => {
    let mainnetTokenAddress = getL1SynthAddressFromL2SynthAddress(e[0])
    sdk.util.sumSingleBalance(balances, mainnetTokenAddress, e[1])
  })
  return balances
}


function tvlSumUp(contract) {
  const { totalFund, withdrawal, deposit } = contract

  return new BigNumber(totalFund)
    .plus(new BigNumber(deposit))
    // XXX: The logic needs more discussion
    // .minus(new BigNumber(withdrawal))
}
async function getV2Balance(_, _1,{ optimism: block }) {
  const ENDPOINT = 'https://earn-api.polynomial.fi/vaults'
  const response = await getConfig('polynomial-vaults', ENDPOINT)
  // Only allow contracts which sets underlying and COLLATERAL
  const v2Contracts = response.filter(contract => contractL1Synths[contract.vaultAddress])
  const multiCalls = v2Contracts.map(contract => ({ target: contract.vaultAddress}))

  const [{output: pendingDeposits}, {output: totalFunds}, {output: totalWithdrawals}] = await Promise.all( [
    sdk.api.abi.multiCall({
      abi: abi2['polynomial_totalQueuedDeposits'],
      calls: multiCalls,
      chain, block,
    }), 
    sdk.api.abi.multiCall({
      abi: abi2['polynomial_totalFunds'],
      calls: multiCalls,
      chain, block,
    }), 
    sdk.api.abi.multiCall({
      abi: abi2['polynomial_totalQueuedWithdrawals'],
      calls: multiCalls,
      chain, block,
    })
  ]) 

  const contractTable = pendingDeposits.reduce((contracts, deposit, idx) => {
    const totalFund = totalFunds[idx].output
    const withdrawal = totalWithdrawals[idx].output
    contracts[deposit.input.target] = {
      totalFund,
      withdrawal,
      deposit: deposit.output,
    }

    return contracts
  }, {})

  const result = Object.keys(contractTable).reduce((balance, vaultAddress) => {
    const amount = tvlSumUp(contractTable[vaultAddress])
    const key =  `ethereum:${contractL1Synths[vaultAddress]}`
    sdk.util.sumSingleBalance(balance, key, +amount)

    return balance
  }, {})

  return result
}

module.exports = {
  optimism: {
    tvl: sdk.util.sumChainTvls([tvl, getV2Balance]),
  },
  hallmarks:[
    [1648728000, "Earn V1 Launch"],
    [1655380800, "Earn V1 Shutdown"],
    [1660132800, "Earn V2 Launch"],
  ],
  methodology: 'Using contract methods, TVL is pendingDeposits + totalFunds + premiumCollected and the asset is UNDERLYING or COLLATERAL (put vs call) ',
}