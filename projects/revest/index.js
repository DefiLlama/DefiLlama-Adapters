const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require("../helper/unwrapLPs")
const { covalentGetTokens, } = require("../helper/http")
const { getUniqueAddresses } = require('../helper/utils')
const sdk = require("@defillama/sdk");

const CutoffABI = "function FNFT_CUTOFF() external view returns (uint256)"
const numFNFTSABI = "function fnftsCreated() external view returns (uint256)"
const getFNFTSupplyABI = "function getSupply(uint256 fnftId) external view returns (uint256)"
const getFNFTConfigABI = "function getFNFT(uint256 fnftId) external view returns (tuple(address asset,,,,,,,) memory)"
const balanceOfABI = "function balanceOf(address account) view returns (uint256)"
const getWalletABI = "function getFNFTAddress(uint256 fnftId) external view returns (address)"

const ZERO_ADDRESS = ADDRESSES.null

const config = {
  ethereum: {
    holder: '0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F',
    revest: '0x120a3879da835a5af037bb2d1456bebd6b54d4ba',
    tokenVaultV2: '0xD672f1E3411c23Edbb49e8EB6C6b1564b2BF8E17',
    fnftHandler: '0xa07E6a51420EcfCB081917f40423D29529705e8a'
  },
  polygon: {
    holder: '0x3cCc20d960e185E863885913596b54ea666b2fe7',
    tokenVaultV2: '0xd2c6eB7527Ab1E188638B86F2c14bbAd5A431d78',
    fnftHandler: '0x6c111d0b0c5f6577de586f7df262f15a6741ddb7'
  },
  fantom: {
    holder: '0x3923E7EdBcb3D0cE78087ac58273E732ffFb82cf',
    tokenVaultV2: '0x0ca61c96d1E0bE5F80f4773be367f4bF2025f224',
    fnftHandler: '0xA6f5efC3499d41fF1Eca9d325cfe13C913a85F45'
  },
  avax: {
    holder: '0x955a88c27709a1EEf4ACa0df0712c67B48240919',
    fnftHandler: '0xd6E44901Ee92c85D7f019BdaF05cbD779f36Edaa'
  },
  optimism: {
    tokenVaultV2: '0x490867a64746AC33f721A778dD8C30BBb0074055',
    fnftHandler: '0xA002Dc3E3C163732F4F5e6F941C87b61B5Afca74',
    holder: '0x490867a64746AC33f721A778dD8C30BBb0074055'
  },
  arbitrum: {
    tokenVaultV2: '0x209F3F7750d4CC52776e3e243717b3A8aDE413eB',
    fnftHandler: '0xd90D465631a1718FDB3eA64C39F41290Addf70da',
    holder: '0x209F3F7750d4CC52776e3e243717b3A8aDE413eB'
  }
}

module.exports = {
  hallmarks: [
    [1648339200, "Reentrancy attack"]
],
  methodology: "We list all tokens in our vault and sum them together",
};

Object.keys(config).forEach(chain => {
  const { holder, revest, tokenVaultV2, fnftHandler} = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _1, { api }) => {
      let balances = {}

      const blacklist = []
      if (revest) blacklist.push(revest.toLowerCase())
      blacklist.push(ZERO_ADDRESS.toLowerCase())

      let owners = []

      if (tokenVaultV2 != null) {

        let info = await api.batchCall([
          {
            target: tokenVaultV2,
            abi: CutoffABI,
            chain: chain
          },
          {
            target: fnftHandler,
            abi: numFNFTSABI,
            chain: chain
          }
        ])

        let cutoff = Number(info[0])
        let numFNFTS = Number(info[1])

        //Build the Multicall to get the supply of each FNFT to check for ones that still exist
        let fnftSupplyCalls = []
        for(let x = cutoff; x < numFNFTS; x++) {
          fnftSupplyCalls.push({
            target: fnftHandler,
            params: x,
          })
        }

        //Get the supply of each to determine if an FNFT is still alive by supply > 0
        let fnftSupplys = await sdk.api.abi.multiCall({
          calls: fnftSupplyCalls,
          abi: getFNFTSupplyABI,
          requery: true,
          permitFailure: false,
          chain: chain
        })

        //If the FNFT still exists, track it's ID
        let aliveFNFTCalls = []
        let aliveFNFTS = {}
        fnftSupplys.output.forEach(supply => {
          if (supply.output != 0) {

            //Track the supply of the FNFT
            aliveFNFTS[supply.input.params[0]] = supply.output

            aliveFNFTCalls.push({
              target: tokenVaultV2,
              params: supply.input.params[0],
            })
          }
        })

        //Get the asset of the FNFT
        let fnftConfigs = await sdk.api.abi.multiCall({
          calls: aliveFNFTCalls,
          abi: getFNFTConfigABI,
          requery: true,
          permitFailure: false,
          chain: chain
        })


        //Link each FNFTId to its underlying token
        let tokenAddressesPerFNFT = {}
        let walletCalls = []
        fnftConfigs.output.forEach(config => {
          if (!blacklist.includes(config.output[0].toLowerCase())) {
            tokenAddressesPerFNFT[config.input.params[0]] = config.output[0]
          
            walletCalls.push({
              target: tokenVaultV2,
              params: [config.input.params[0]],
            })
          }

        })

        //Get the wallet for each FNFT
        let wallets = await sdk.api.abi.multiCall({
          abi: getWalletABI,
          calls: walletCalls,
          chain: chain,
          requery: true,
          permitFailure: false,
        })

        //Prepare Calldata to check the balance of each token in each wallet
        let balanceOfMultiCalls = []
        wallets.output.forEach(wallet => {
          balanceOfMultiCalls.push({
            target: tokenAddressesPerFNFT[wallet.input.params[0]],
            params: wallet.output,
          })
        })

        let multiCallBalances = await sdk.api.abi.multiCall({
          abi: balanceOfABI,
          calls: balanceOfMultiCalls,
          chain: chain,
          requery: true,
          permitFailure: false,
        })

        //Record balances, increasing stored amount if necessary
        multiCallBalances.output.forEach(balance => {
          if (balances[balance.input.target] == undefined) {
            balances[balance.input.target] = 0
          }

          balances[balance.input.target] = (Number(balances[balance.input.target]) + Number(balance.output))

        })
        
      }

      //Get values in tokenVaultV1
      owners.push(holder);
      let tokens = await covalentGetTokens(holder, api.chain)
      tokens = getUniqueAddresses(tokens).filter(t => !blacklist.includes(t)) // filter out staking and LP tokens
      let tokenVaultV1Balances = await sumTokens2({ api, owners: owners, tokens, })

      //For each key in V1 Balances append to regular balances and return
      Object.keys(balances).forEach(key => {
        if (tokenVaultV1Balances[key] == undefined) {
          tokenVaultV1Balances[`${chain}:${key}`] = 0
        }
        tokenVaultV1Balances[`${chain}:${key}`] += balances[key]
      })
      return tokenVaultV1Balances;
    },
  }

  if (revest)
    module.exports[chain].staking = async (_, _b, _1, { api }) => {
      //Get the number of FNFTS for the TokenVaultV2
      let info = await api.batchCall([
          {
            target: config[chain].tokenVaultV2,
            abi: CutoffABI,
            chain: chain
          },
          {
            target: config[chain].fnftHandler,
            abi: numFNFTSABI,
            chain: chain
          }
        ])

        let cutoff = Number(info[0])
        let numFNFTS = Number(info[1])

        //Build Multicall Data
        let calls = []
        for(let x = cutoff; x < numFNFTS; x++) {
          calls.push({
            target: config[chain].tokenVaultV2,
            params: [x]
          })
        }

        //Get the wallet address for each FNFT via multicall
        let walletMultiCallList = await sdk.api.abi.multiCall({
          abi: getWalletABI,
          calls: calls,
          chain: chain,
          requery: true,
          permitFailure: false 
        })
        let wallets = []
        walletMultiCallList.output.forEach(wallet => {
          // console.log(`output: ${JSON.stringify(wallet)}`)
          wallets.push(wallet.output)
        })

        wallets.push(holder);

        //Return the balance of revest in every wallet.
        return sumTokens2({ api, owners: wallets, tokens: [revest] })
    }
})