const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getParamCalls } = require("../helper/utils");

const EXCLUDED_PLATFORMS = {
  "12": true, // TETU_SWAP
  "29": true // TETU self farm
}
const EXCLUDED_VAULTS = {
  "ethereum": {
    "0xfe700d523094cc6c673d78f1446ae0743c89586e": true, // tetuBAL ethereum
  },
  "fantom": {
    "0x27c616838b8935c8a34011d0e88ba335040ac7b1": true // broken MAI on fantom
  }
}

module.exports = {
  start: 1628024400,  //Tue Aug 03 2021 21:00:00 GMT+0000
  misrepresentedTokens: true,
};

const config = {
  polygon: {
    bookkeeper: '0x0A0846c978a56D6ea9D2602eeb8f977B21F3207F',
    contract_Reader: '0xCa9C8Fba773caafe19E6140eC0A7a54d996030Da',
    controllerV2: '0x33b27e0A2506a4A2FBc213a01C51d0451745343a',
    veTETU: '0x6FB29DD17fa6E27BD112Bc3A2D0b8dae597AeDA4',
  },
  fantom: {
    bookkeeper: '0x00379dD90b2A337C4652E286e4FBceadef940a21',
    contract_Reader: '0xa4EB2E1284D9E30fb656Fe6b34c1680Ef5d4cBFC',
    controllerV2: '',
    veTETU: '',
  },
  bsc: {
    bookkeeper: '0x8A571137DA0d66c2528DA3A83F097fbA10D28540',
    contract_Reader: '0xE8210A2d1a7B56115a47B8C06a72356773f6838E',
    controllerV2: '',
    veTETU: '',
  },
  ethereum: {
    bookkeeper: '0xb8bA82F19A9Be6CbF6DAF9BF4FBCC5bDfCF8bEe6',
    contract_Reader: '0x6E4D8CAc827B52E7E67Ae8f68531fafa36eaEf0B',
    controllerV2: '',
    veTETU: '',
  },
}

Object.keys(config).forEach(chain => {
  const { bookkeeper, contract_Reader, controllerV2, veTETU } = config[chain]
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

      const vaultsCall = []
      for (let i = 0; i < vaultLength; i++) {
        if (EXCLUDED_PLATFORMS[platforms[i].output] === true)
          continue;
        // exclude duplication count or broken vaults
        if (EXCLUDED_VAULTS[chain] && EXCLUDED_VAULTS[chain][vaultAddresses[i].output.toLowerCase()] === true)
          continue;
        vaultsCall.push({ params: vaultAddresses[i].output })
      }

      // TetuV2 vaults
      let usdcsV2 = [];
      if(controllerV2 && controllerV2 !== '') {
        const vaultsV2Call = [];
        const vaultsV2 = (
          await sdk.api.abi.call({
            abi: abi.vaultsList,
            target: controllerV2,
            block, chain,
          })
        ).output;
        for(const vault of vaultsV2) {
          vaultsV2Call.push({ params: vault })
        }
        const { output: _usdcsV2 } = await sdk.api.abi.multiCall({
          target: contract_Reader,
          abi: abi.vaultERC4626TvlUsdc,
          calls: vaultsV2Call,
          chain, block,
        })
        usdcsV2 = _usdcsV2;
      }

      // veTETU
      let veTETU_USDC = 0;
      if(veTETU && veTETU !== '') {
        for(let i = 0; i < 100; i++) {
          let token = '';
          try {
            token = (
              await sdk.api.abi.call({
                abi: abi.veTokens,
                target: veTETU,
                params: i,
                block, chain
              })
            ).output;
          } catch (e) {
            // assume that tokens ended
            // we don't have length for tokens so this workaround
            break;
          }

          const amount = (
            await sdk.api.abi.call({
              abi: abi.balanceOf,
              target: token,
              params: veTETU,
              block, chain,
            })
          ).output;

          const price = (
            await sdk.api.abi.call({
              abi: abi.getPrice,
              target: contract_Reader,
              params: token,
              block, chain,
            })
          ).output;

          // assume all tokens inside with decimal 18
          // if not need addtionial call with decimals
          veTETU_USDC += amount * price / 1e36;
        }

      }

      const { output: usdcs } = await sdk.api.abi.multiCall({
        target: contract_Reader,
        abi: abi.vaultTvlUsdc,
        calls: vaultsCall,
        chain, block,
      })

      let total = veTETU_USDC
      usdcs.forEach(i => total += i.output / 1e18)
      usdcsV2.forEach(i => total += i.output / 1e18)
      return {
        'usd-coin': total
      }
    }
  }
})
