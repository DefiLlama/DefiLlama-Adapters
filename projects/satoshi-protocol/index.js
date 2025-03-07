const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs")
const { getLogs } = require("../helper/cache/getLogs");
const AssetConfigSettingEventABI = "event AssetConfigSetting(address asset,uint256 feeIn,uint256 feeOut,uint256 debtTokenMintCap,uint256 dailyMintCap,address oracle,bool isUsingOracle,uint256 swapWaitingPeriod,uint256 maxPrice,uint256 minPrice)";
const VaultTokenStrategySetEventABI = "event TokenStrategySet(address token, address strategy)";


function createExports({
  troveList,
  nymList, // { address, fromBlock }[]
  aaveStrategyVaults, // { address, asset, aToken }[]
  pellStrategyVaults, // { address, asset }[]
  pellStrategyVaultsV2, // { address, fromBlock }[]
}) {
  return {
    tvl: async (api) => {
      const tokensAndOwners = []
      if (troveList) {
        // owners.push(...troveList);
        await getCollateralsFromTrove(api, troveList, tokensAndOwners);
      }

      if (nymList && nymList.length > 0) {
        for (let i = 0; i < nymList.length; i++) {
          await getAssetListFromNymContract(api, nymList[i].address, nymList[i].fromBlock, tokensAndOwners);
        }
      }

      if (aaveStrategyVaults) {
        for (let index = 0; index < aaveStrategyVaults.length; index++) {
          const { address: vault, aToken, asset } = aaveStrategyVaults[index];
          tokensAndOwners.push([asset, vault])
          tokensAndOwners.push([aToken, vault])
        }
      }

      if (pellStrategyVaults) {
        const vaults = pellStrategyVaults.map(i => i.address)
        const tokens = pellStrategyVaults.map(i => i.asset)
        const strategies = await api.multiCall({ abi: 'address:pellStrategy', calls: vaults })
        const calls2 = strategies.map((v, i) => ({ target: v, params: vaults[i] }))
        const bals = await api.multiCall({ abi: "function userUnderlyingView(address) external view returns (uint256)", calls: calls2 })
        api.add(tokens, bals)
      }

      if (pellStrategyVaultsV2) {
        for (let i = 0; i < pellStrategyVaultsV2.length; i++) {
          const { address: vaultAddress, fromBlock } = pellStrategyVaultsV2[i];
          const logs = await getLogs({ api, target: vaultAddress, fromBlock, eventAbi: VaultTokenStrategySetEventABI, onlyArgs: true });
          const assets = logs.map(item => item.token);
          const calls = assets.map((asset) => ({ target: vaultAddress, params: asset }))
          const assetAmounts = await api.multiCall({ abi: "function getPosition(address) external view returns (uint256)", calls: calls })
          api.add(assets, assetAmounts)
        }
      }

      return sumTokens2({ api, tokensAndOwners, })
    },
  }
}

async function getCollateralsFromTrove(api, troveList, tokensAndOwners) {
  const tokens = await api.multiCall({ abi: 'address:collateralToken', calls: troveList })
  tokens.forEach((token, i) => tokensAndOwners.push([token, troveList[i]]))
}

async function getAssetListFromNymContract(api, nymContractAddress, fromBlock, tokensAndOwners) {
  const logs = await getLogs({ api, target: nymContractAddress, fromBlock, eventAbi: AssetConfigSettingEventABI, onlyArgs: true });
  const assetList = logs.map(item => item.asset);
  assetList.forEach(asset => tokensAndOwners.push([asset, nymContractAddress]));
}



module.exports = {
  bevm: createExports({
    troveList: [
      '0x0598Ef47508Ec11a503670Ac3B642AAE8EAEdEFA', // BEVM WBTC Collateral(V1)
      '0xa794a7Fd668FE378E095849caafA8C8dC7E84780', // BEVM wstBTC Collateral(V1)
      '0xe7E23aD9c455c2Bcd3f7943437f4dFBe9149c0D2', // BEVM WBTC Collateral(V2)
      '0xD63e204F0aB688403205cFC144CAdfc0D8C68458', // BEVM wstBTC Collateral(V2)
    ],
  }),
  btr: createExports({
    troveList: [
      '0xf1A7b474440702BC32F622291B3A01B80247835E', // BITLAYER WBTC Collateral(V1)
      '0xe9897fe6C8bf96D5ef8B0ECC7cBfEdef9818232c', // BITLAYER stBTC Collateral(V1)
      '0x3DC0565bcA627823828Aa3F2f8d805ec8a16005a', // BITLAYER WBTC Collateral(V2)
      '0x404dCd7E15947D04063B436f71d93E2d79023aa9', // BITLAYER stBTC Collateral(V2)
    ],
    nymList: [{
      address: '0xC562321a494290bE5FeDF9092cee35DE6f884D50',
      fromBlock: 3442163,
    }, {
      address: '0x95E5b977c8c33DE5b3B5D2216F1097C2017Bdf71',
      fromBlock: 8880614,
    }]
  }),
  bob: createExports({
    troveList: [
      '0xc50D117C21054455aE9602237d3d17ca5Fa91288', // BOB WETH Collateral(V1)
      '0xBDFedF992128CbF10974DC935976116e10665Cc9', // BOB WBTC Collateral(V1)
      '0x8FAE9D3dBeE1c66b84E90df21A1DbdBab9262843', // BOB tBTC Collateral(V1)
      '0xFFFE50D535aaA9B16499D2fDb3BbD94144ca5336', // BOB SolvBTC Collateral(V1)
      '0xa0B2325BB635679cCFbf50570edd0C6F3D7dA81e', // BOB SolvBTC.BBN Collateral(V1)
      '0xF091CE6116294A3b13D0f57c6eaCb8837e513CaD', // BOB FBTC Collateral(V1)
      '0xB6C69F4EfC6ad9d12C5Fc3715722D5bbEa712a3f', // WBTC Collateral(V2)
      '0xbf626Fc742bFfD6F17de9Cf2480Da25Dad4D5135', // TBTC Collateral(V2)
      '0x39F36DA1f4028473d41e077E178c8551bE4bb231', // SolvBTC Collateral(V2)
      '0x1F6eF853341037c5C057101F2E38C15c95130807', // SolvBTC_BBN Collateral(V2)
      '0x4dEA4c11bDd3Ad05063405C7167Fa9B3f95Aea90', // FBTC Collateral(V2)
    ],
    nymList: [{
      address: '0x7253493c3259137431a120752e410b38d0c715C2',
      fromBlock: 4614620,
    }, {
      address: '0xEC272aF6e65C4D7857091225fa8ED300Df787CCF',
      fromBlock: 13021825,
    }],
    aaveStrategyVaults: [
      {
        address: '0x713dD0E14376a6d34D0Fde2783dca52c9fD852bA',
        aToken: '0xd6890176e8d912142AC489e8B5D8D93F8dE74D60', // aBOBWBTC
        asset: ADDRESSES.bob.WBTC, // BOB WBTC
      }
    ],
    pellStrategyVaults: [
      {
        address: '0x04485140d6618be431D8841de4365510717df4fd',
        asset: ADDRESSES.bob.WBTC, // BOB WBTC
      }
    ],
  }),
  bsquared: createExports({
    troveList: [
      '0xa79241206c3008bE4EB4B62A48A4F98303060D4f', // BSquare WBTC Collateral(V1)
      '0xc6F361db5eC432E95D0A08A9Fbe0d7412971cE6c', // BSquare uBTC Collateral(V1)
      '0x8FBfe28D6E5424d7f8c8c29A4910ce8a618d2D54', // WBTC Collateral(V2)
      '0xa03B86E93c98FE95caC2A6645fF271Bb67040eab', // uBTC Collateral(V2)
      '0xb38653A0190252487FC6502D1D7B41A9647fB84b', // uniBTC Collateral(V2)
    ],
    pellStrategyVaultsV2: [
      {
        address: '0x1F745AEC91A7349E4F846Ae1D94915ec4f6cF053',
        fromBlock: 11581100,
      }
    ]
  }),
  bsc: createExports({
    troveList: [
      '0xb655775C4C7C6e0C2002935133c950FB89974928', // WBTC Collateral(V2)
      '0x5EA26D0A1a9aa6731F9BFB93fCd654cd1C3079Ec', // BTCB Collateral(V2)
    ],
    
  }),
}