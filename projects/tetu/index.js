const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getParamCalls } = require("../helper/utils");

const EXCLUDED_PLATFORMS = {
  "12": true, // TETU_SWAP
  "29": true // TETU self farm
}

module.exports = {
  start: 1628024400,  //Tue Aug 03 2021 21:00:00 GMT+0000
  misrepresentedTokens: true,
};

const config = {
  polygon: {
    bookkeeper: '0x0A0846c978a56D6ea9D2602eeb8f977B21F3207F',
    contract_Reader: '0xCa9C8Fba773caafe19E6140eC0A7a54d996030Da',
  },
  fantom: {
    bookkeeper: '0x00379dD90b2A337C4652E286e4FBceadef940a21',
    contract_Reader: '0xa4EB2E1284D9E30fb656Fe6b34c1680Ef5d4cBFC',
  },
  bsc: {
    bookkeeper: '0x8A571137DA0d66c2528DA3A83F097fbA10D28540',
    contract_Reader: '0xE8210A2d1a7B56115a47B8C06a72356773f6838E',
  },
  ethereum: {
    bookkeeper: '0xb8bA82F19A9Be6CbF6DAF9BF4FBCC5bDfCF8bEe6',
    contract_Reader: '0x6E4D8CAc827B52E7E67Ae8f68531fafa36eaEf0B',
  },
}

Object.keys(config).forEach(chain => {
  const { bookkeeper, contract_Reader, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const vaultLength = (
        await sdk.api.abi.call({
          abi: abi.vaultsLength,
          target: bookkeeper,
          block, chain,
        })
      ).output;
      let calls = getParamCalls(vaultLength)
      const { output: vaultAddresses } = await sdk.api.abi.multiCall({
        target: bookkeeper,
        abi: abi.vaults,
        calls, chain, block,
      })

      calls = vaultAddresses.map(i => ({ target: i.output }))
      const { output: strategies } = await sdk.api.abi.multiCall({
        abi: abi.strategy,
        calls,
        chain, block,
      })

      calls = strategies.map(i => ({ target: i.output }))
      const { output: platforms } = await sdk.api.abi.multiCall({
        abi: abi.platform,
        calls, chain, block,
      })

      calls = []
      for (let i = 0; i < vaultLength; i++) {
        if (EXCLUDED_PLATFORMS[platforms[i].output] === true)
          continue;
        calls.push({ params: vaultAddresses[i].output })
      }

      const { output: usdcs } = await sdk.api.abi.multiCall({
        target: contract_Reader,
        abi: abi.vaultTvlUsdc,
        calls, chain, block,
      })

      let total = 0
      usdcs.forEach(i => total += i.output / 1e18)
      return {
        'usd-coin': total
      }
    }
  }
})
