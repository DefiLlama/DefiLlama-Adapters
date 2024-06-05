const { sumTokens2, } = require("../helper/unwrapLPs")

const CutoffABI = "function FNFT_CUTOFF() external view returns (uint256)"
const numFNFTSABI = "function fnftsCreated() external view returns (uint256)"
const getFNFTSupplyABI = "function getSupply(uint256 fnftId) external view returns (uint256)"
const getFNFTConfigABI = "function getFNFT(uint256 fnftId) view returns ((address asset, address pipeToContract, uint256 depositAmount, uint256 depositMul, uint256 split, uint256 depositStopTime, bool maturityExtension, bool isMulti, bool nontransferrable))"
const getWalletABI = "function getFNFTAddress(uint256 fnftId) external view returns (address)"

const config = {
  ethereum: {
    holder: '0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F',
    revest: '0x120a3879da835a5af037bb2d1456bebd6b54d4ba',
    tokenVaultV2: '0xD672f1E3411c23Edbb49e8EB6C6b1564b2BF8E17',
    fnftHandler: '0xa07E6a51420EcfCB081917f40423D29529705e8a',
    revest_lp: '0x6490828Bd87Be38279A36F029f3b9Af8b4E14B49'
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
  const { holder, revest, tokenVaultV2, fnftHandler, revest_lp } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {

      const blacklistedTokens = []
      if (revest) blacklistedTokens.push(revest.toLowerCase())

      if (tokenVaultV2 != null) {

        let info = await api.batchCall([
          { target: tokenVaultV2, abi: CutoffABI, },
          { target: fnftHandler, abi: numFNFTSABI, }
        ])

        let cutoff = info[0]
        let numFNFTS = info[1]

        //Build the Multicall to get the supply of each FNFT to check for ones that still exist
        let fnftSupplyCalls = []
        for (let i = cutoff; i < numFNFTS; i++)
          fnftSupplyCalls.push({ target: fnftHandler, params: i, })


        //Get the supply of each to determine if an FNFT is still alive by supply > 0
        let fnftSupplys = await api.multiCall({ calls: fnftSupplyCalls, abi: getFNFTSupplyABI, })

        //If the FNFT still exists, track it's ID
        let aliveFNFTCalls = []
        let aliveFNFTS = {}
        fnftSupplys.forEach((supply, i) => {
          if (supply != 0) {

            //Track the supply of the FNFT
            const x = fnftSupplyCalls[i].params
            aliveFNFTS[x] = supply

            aliveFNFTCalls.push({ target: tokenVaultV2, params: x, })
          }
        })

        //Get the asset of the FNFT
        let fnftConfigs = await api.multiCall({ calls: aliveFNFTCalls, abi: getFNFTConfigABI, })


        //Link each FNFTId to its underlying token
        let tokenAddressesPerFNFT = {}
        let walletCalls = []
        fnftConfigs.forEach((config, i) => {
          if (!blacklistedTokens.includes(config[0].toLowerCase())) {
            const x = aliveFNFTCalls[i].params
            tokenAddressesPerFNFT[x] = config[0]
            walletCalls.push({ target: tokenVaultV2, params: x, })
          }
        })

        //Get the wallet for each FNFT
        let wallets = await api.multiCall({ abi: getWalletABI, calls: walletCalls, })
        const tokensAndOwners = []

        //Prepare Calldata to check the balance of each token in each wallet
        wallets.forEach((wallet, i) => {
          tokensAndOwners.push([tokenAddressesPerFNFT[walletCalls[i].params], wallet])
        })

        await api.sumTokens({ tokensAndOwners })
      }

      const tokens = []

      if (revest_lp)
        tokens.push(revest_lp)
      return sumTokens2({ api, owner: holder, fetchCoValentTokens: true, blacklistedTokens, tokens, resolveLP: true, })
    },
  }

  if (revest)
    module.exports[chain].staking = async (api) => {
      //Get the number of FNFTS for the TokenVaultV2
      let info = await api.batchCall([
        { target: config[chain].tokenVaultV2, abi: CutoffABI, },
        { target: config[chain].fnftHandler, abi: numFNFTSABI, }
      ])

      let cutoff = Number(info[0])
      let numFNFTS = Number(info[1])

      //Build Multicall Data
      let calls = []
      for (let x = cutoff; x < numFNFTS; x++)
        calls.push({ target: config[chain].tokenVaultV2, params: x })


      //Get the wallet address for each FNFT via multicall
      let wallets = await api.multiCall({ abi: getWalletABI, calls: calls, })

      wallets.push(holder);

      //Return the balance of revest in every wallet.
      return sumTokens2({ api, owners: wallets, tokens: [revest] })
    }
})
