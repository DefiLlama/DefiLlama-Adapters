const sdk = require("@defillama/sdk")
const abi = require("./abi.json")
const {sumTokens, unwrapCrv} = require("../helper/unwrapLPs.js")
const {staking} = require("../helper/staking.js")
const {pool2s} = require("../helper/pool2.js")

const registry = '0x72d15eae2cd729d8f2e41b1328311f3e275612b9' // same address for polygon and mainnet

// Mapping from tokens locked in APWine to ones that can be read by coingecko
const transformMapping_ethereum = {
  '0xaC14864ce5A98aF3248Ffbf549441b04421247D3': '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f', // xSDT -> SDT
  '0x6b1D394Ca67fDB9C90BBd26FE692DdA4F4f53ECD': '0xcafe001067cdef266afb7eb5a286dcfd277f3de5', // sPSP_PP4 -> PSP
  '0xA991356d261fbaF194463aF6DF8f0464F8f1c742': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // tfUSDC -> USDC
  '0x24E79e946dEa5482212c38aaB2D0782F04cdB0E0': '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // palStkAave -> AAVE
}
const transformMapping_polygon = {
}
const tokensToUnwrap =  {
  'polygon:0xDDe43710DefEf6CbCf820B18DeBfC3cF9a4f449F': {'type': 'crv', 'unwrapTo': '0xad326c253a84e9805559b73a08724e11e49ca651'},  // miFARM_4eur-f (bf4eur-f) -> 4eur-f
  'polygon:0x5A0801BAd20B6c62d86C566ca90688A6b9ea1d3f': {'type': 'crv', 'unwrapTo': '0xdad97f7713ae9437fa9249920ec8507e5fbb23d3'}, // Moo Curve aTriCrypto3 -> aTriCrypto3
}
const transform  = {
  'ethereum': addr => transformMapping_ethereum[addr] || addr,
  'polygon': addr => transformMapping_polygon[addr] || `polygon:${addr}`
}

// Staking - vote escrowed staking ala crv
const APW = '0x4104b135dbc9609fc1a9490e61369036497660c8'
const veAPW = '0xc5ca1ebf6e912e49a6a70bb0385ea065061a4f09'

// Pool2 - APW-XXX LP staked
const APW_WETH_cometh = '0x70797fc5b1c04541113b5ac20ea05cb390392e30'
const APW_MUST_cometh = '0x174f902194fce92ef3a51079b531f1e5073de335'
const APW_WETH_cometh_staking = '0x4e2114f7fa11dc0765ddd51ad98b6624c3bf1908'
const APW_MUST_cometh_staking = '0xb7ae78f49ac9bd9388109a4c5f53c6b79be4deda'

const tvl_from_registry = (chain) => {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {}
    const block = chainBlocks[chain]
    // Get vaults count, vault addresses, and IBT tokens held by each vault
    const {output: futureVaultCount} = await sdk.api.abi.call({
        abi: abi['futureVaultCount'],
        target: registry,
        block,
        chain,
      })
    const {output: futureVaults} = await sdk.api.abi.multiCall({
        abi: abi['getFutureVaultAt'],
        calls:  [...Array(parseInt(futureVaultCount)).keys()].map((i) => ({
          target: registry,
          params: i,
        })),
        block,
        chain,
      })
    const {output: IBTAddressTokens} = await sdk.api.abi.multiCall({
      abi: abi['getIBTAddress'],
      calls: futureVaults.map((vault) => ({
        target: vault.output,
      })),
      block,
      chain,
    })

    // Unwrap tokens amount held by each vault
    const tokensAndOwners = IBTAddressTokens.map(t => [t.output, t.input.target])
    await sumTokens(balances, tokensAndOwners, block, chain, transform[chain]) 
    console.log(`balances for chain ${chain}`, balances) 

    // Handle wrapped pools in balances - like curvePools, etc
    for (const token of Object.keys(balances)) {
      if (Object.keys(tokensToUnwrap).includes(token)) {
        if (tokensToUnwrap[token].type === 'crv') {
          await unwrapCrv(balances, tokensToUnwrap[token].unwrapTo, balances[token], block, chain, transform[chain]) 
        }
        balances[token] = 0 // Once unwrapped, set balance of wrapped curve token to zero
      }
    }

    return balances
  }
}


module.exports = {
  ethereum: {
    tvl: tvl_from_registry('ethereum'),
    staking: staking(veAPW, APW, "ethereum"), 
  },
  polygon: {
    tvl: tvl_from_registry('polygon'), 
    pool2: pool2s([APW_WETH_cometh_staking, APW_MUST_cometh_staking], [APW_WETH_cometh, APW_MUST_cometh], "polygon", id=>`polygon:${id}`)
  },
  methodology: `Use the registry to retrieve futureVaults, and get for each vault the IBT which is the token that this vault holds - the user locked collateral`
}