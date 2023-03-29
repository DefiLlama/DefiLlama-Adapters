const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js")
const abi = require('./abi.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const { log } = require("../helper/utils");

// taken from https://app.fodl.finance/config.json
const config = {
  ethereum: {
    position_nft: '0x70febba7d45cfe6d99847ba4ccc393373b1ea8aa',
    lens_contract: '0x080155C42b0854C3A718B610cC5183e963851Afb',
    pool2: [
      ['0xa5c475167f03b1556c054e0da78192cd2779087f', '0xf958a023d5b1e28c32373547bdde001cad17e9b4'],
      ['0xce7e98d4da6ebda6af474ea618c6b175729cd366', '0xa7453338ccc29e4541e6c6b0546a99cc6b9eb09a'],
    ],
    staking: [
      ['0x4c2e59d098df7b6cbae0848d66de2f8a4889b9c3', '0x7e05540A61b531793742fde0514e6c136b5fbAfE'],
    ],
  },
  polygon: {
    position_nft: '0x7243c51c24b302b01094785f3c826f9311525613',
    lens_contract: '0xbfE6971Fc6F195bcacB72beE3427f5b4d8C3dc07',
    pool2: [
      ['0x2fc4dfcee8c331d54341f5668a6d9bcdd86f8e2f', '0xea7336c408ec8012e6b97368198512597e49c88a'],
    ],
  },
  bsc: {
    position_nft: '0x4c2e59d098df7b6cbae0848d66de2f8a4889b9c3',
    lens_contract: '0x6032035731c9F0b2E53Da63ca15444375E946559',
  },
}

module.exports = {
  methodology: "FODL leverages users positions on Aave and Compound. The fodl lens contract is used to get the positions metadata, especially supplyAmount and supplyTokenAddress, which counts as the TVL of the position of the user. Pool2 TVL are the tokens locked in the SUSHI pools",
};

Object.keys(config).forEach(chain => {
  const { position_nft, lens_contract, pool2, staking, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      // Get number of positions opened by users by querying the supply of ERC721 tokens
      const erc721_supply = (await sdk.api.abi.call({ target: position_nft, abi: 'erc20:totalSupply', block, chain, })).output;
      log(`${erc721_supply} position ownership ERC 721 existing`)

      // Get all positions contracts addresses
      const positionsCalls = [...Array(parseInt(erc721_supply)).keys()].map(t => ({ target: position_nft, params: t }))
      const positionsAddresses = (
        await sdk.api.abi.multiCall({
          calls: positionsCalls,
          abi: abi['tokenByIndex'],
          block, chain,
        })
      ).output


      // FODL uses flashloans to leverage the user provided collateral. TVL should count only what the user brought in, which is supplyAmount of supplyTokenAddress 
      // const usersSuppliedBalances = usersPositions.map(t => ({[t.supplyTokenAddress]: t.supplyAmount}))
      const balances = {}

      // console.log(positionsAddresses.map(t => t.output).slice(0,5))
      // The call to getPositionsMetadata only accounts for max 192 positions
      const calls = positionsAddresses.map(i => ({ params: [[i.output]] }))
      const { output: data } = await sdk.api.abi.multiCall({
        target: lens_contract,
        abi: abi.getPositionsMetadata,
        calls, block, chain,
      })
      data.forEach(({ output, input, success }) => {
        if (!success) {
          // log(chain, `failed for ${input.params}`)
          return;
        }
        // log(output[0])
        // if (+output[0].positionValue > 0)
          sdk.util.sumSingleBalance(balances, chain + ':' + output[0].supplyTokenAddress, output[0].supplyAmount)
          // sdk.util.sumSingleBalance(balances, chain + ':' + output[0].borrowTokenAddress, output[0].borrowAmount)
      })
      return balances
    }
  }

  if (pool2)
    module.exports[chain].pool2 = sumTokensExport({ tokensAndOwners: pool2, chain, })

  if (staking)
    module.exports[chain].staking = sumTokensExport({ tokensAndOwners: staking, chain, })
})
