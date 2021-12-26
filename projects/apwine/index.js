const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const {sumTokens} = require("../helper/unwrapLPs.js");
const {staking} = require("../helper/staking.js");

const registry = '0x72d15eae2cd729d8f2e41b1328311f3e275612b9' // same address for polygon and mainnet

// Mapping from tokens locked in APWine to ones that can be read by coingecko
const transformMapping_ethereum = {
  '0xaC14864ce5A98aF3248Ffbf549441b04421247D3': '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f', // xSDT -> SDT
  '0x6b1D394Ca67fDB9C90BBd26FE692DdA4F4f53ECD': '0xcafe001067cdef266afb7eb5a286dcfd277f3de5', // sPSP_PP4
  '0xA991356d261fbaF194463aF6DF8f0464F8f1c742': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // tfUSDC
  '0x24E79e946dEa5482212c38aaB2D0782F04cdB0E0': '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // palStkAave -> aave
}
const transformMapping_polygon = {
  '0xDDe43710DefEf6CbCf820B18DeBfC3cF9a4f449F': '', // miFARM_4eur-f (bf4eur-f)
  '0x5A0801BAd20B6c62d86C566ca90688A6b9ea1d3f': 'polygon:0xd7d4a4c67e9c1f5a913bc38e87e228f4b8820e8a' // Moo Curve aTriCrypto3 
}
const transform  = {
  'ethereum': addr => transformMapping_ethereum[addr] || addr,
  'polygon': addr => transformMapping_polygon[addr] || `polygon:${addr}`
}

// Staking
const APW = '0x4104b135dbc9609fc1a9490e61369036497660c8'
const veAPW = '0xc5ca1ebf6e912e49a6a70bb0385ea065061a4f09'


const tvl_from_registry = (chain) => {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
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
    await sumTokens(balances, tokensAndOwners, block, chain, transform[chain]) // id=>`${chain}:${id}`
    console.log(`balances for chain ${chain}`, balances) 
    return balances
  };
}

module.exports = {
  ethereum: {
    tvl: tvl_from_registry('ethereum'),
    staking: staking(veAPW, APW, "ethereum")
  },
  polygon: {
    tvl: tvl_from_registry('polygon'), // ethereum polygon
  },
  methodology: `Use the registry to retrieve futureVaults, and get for each vault the IBT which is the token that this vault holds - the user locked collateral`
};
