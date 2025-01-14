const { sumTokens2 } = require("../helper/unwrapLPs")
const { getLogs } = require("../helper/cache/getLogs");
const AssetConfigSettingEventABI = "event AssetConfigSetting(address asset,uint256 feeIn,uint256 feeOut,uint256 debtTokenMintCap,uint256 dailyMintCap,address oracle,bool isUsingOracle,uint256 swapWaitingPeriod,uint256 maxPrice,uint256 minPrice)";
const VaultTokenStrategySetEventABI = "event TokenStrategySet(address token, address strategy)";


function createExports({
  troveList,
  nymInformation, // { address, fromBlock }
  aaveStrategyVaults, // { address, asset, aToken }[]
  pellStrategyVaults, // { address, asset }[]
  pellStrategyVaultsV2, // { address, fromBlock }[]
}) {
  return {
    tvl: async (api) => {
      const tokens = [];
      const owners = [];
      if (troveList) {
        owners.push(...troveList);
        const collaterals = await getCollateralsFromTrove(api, troveList);
        tokens.push(...collaterals);
      }

      if (nymInformation) {
        const assetList = await getAssetListFromNymContract(api, nymInformation.address, nymInformation.fromBlock);
        assetList.forEach(asset => {
          owners.push(nymInformation.address);
          tokens.push(asset);
        })
      }

      if (aaveStrategyVaults) {
        const calls = []
        const tokens = []
        for (let index = 0; index < aaveStrategyVaults.length; index++) {
          const { address: vault, aToken, asset } = aaveStrategyVaults[index];
          tokens.push(asset)
          calls.push({ target: aToken, params: vault })
        }
        const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls })
        api.add(tokens, bals)
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
        for(let i = 0; i < pellStrategyVaultsV2.length; i++) {
          const { address: vaultAddress, fromBlock } = pellStrategyVaultsV2[i];
          const logs = await getLogs({ api, target: vaultAddress, fromBlock, eventAbi: VaultTokenStrategySetEventABI, onlyArgs: true });
          const assets = logs.map(item => item.token);
          const calls = assets.map((asset) => ({ target: vaultAddress, params: asset }))
          const assetAmounts = await api.multiCall({ abi: "function getPosition(address) external view returns (uint256)", calls: calls })
          api.add(assets, assetAmounts)
        }
      }

      return sumTokens2({ api, tokensAndOwners2: [tokens, owners] })
    },
  }
}

async function getCollateralsFromTrove(api, troveList) {
  const tokens = await api.multiCall({ abi: 'address:collateralToken', calls: troveList })
  return tokens;
}

async function getAssetListFromNymContract(api, nymContractAddress, fromBlock) {
  const logs = await getLogs({ api, target: nymContractAddress, fromBlock, eventAbi: AssetConfigSettingEventABI, onlyArgs: true });
  const assetList = logs.map(item => item.asset);
  return assetList;
}



module.exports = {
  bevm: createExports({
    troveList: [
      '0x0598Ef47508Ec11a503670Ac3B642AAE8EAEdEFA', // BEVM WBTC Collateral
      '0xa794a7Fd668FE378E095849caafA8C8dC7E84780', // BEVM wstBTC Collateral
    ],
  }),
  btr: createExports({
    troveList: [
      '0xf1A7b474440702BC32F622291B3A01B80247835E', // BITLAYER WBTC Collateral
      '0xe9897fe6C8bf96D5ef8B0ECC7cBfEdef9818232c', // BITLAYER stBTC Collateral
    ],
    nymInformation: {
      address: '0xC562321a494290bE5FeDF9092cee35DE6f884D50',
      fromBlock: 3442163,
    }
  }),
  bob: createExports({
    troveList: [
      '0xc50D117C21054455aE9602237d3d17ca5Fa91288', // BOB WETH Collateral
      '0xBDFedF992128CbF10974DC935976116e10665Cc9', // BOB WBTC Collateral
      '0x8FAE9D3dBeE1c66b84E90df21A1DbdBab9262843', // BOB tBTC Collateral
      '0xFFFE50D535aaA9B16499D2fDb3BbD94144ca5336', // BOB SolvBTC Collateral
      '0xa0B2325BB635679cCFbf50570edd0C6F3D7dA81e', // BOB SolvBTC.BBN Collateral
    ],
    nymInformation: {
      address: '0x7253493c3259137431a120752e410b38d0c715C2',
      fromBlock: 4614620,
    },
    aaveStrategyVaults: [
      {
        address: '0x713dD0E14376a6d34D0Fde2783dca52c9fD852bA',
        aToken: '0xd6890176e8d912142AC489e8B5D8D93F8dE74D60', // aBOBWBTC
        asset: '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3', // BOB WBTC
      }
    ],
    pellStrategyVaults: [
      {
        address: '0x04485140d6618be431D8841de4365510717df4fd',
        asset: '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3', // BOB WBTC
      }
    ],
  }),
  bsquared: createExports({
    troveList: [
      '0xa79241206c3008bE4EB4B62A48A4F98303060D4f', // BSquare WBTC Collateral
      '0xc6F361db5eC432E95D0A08A9Fbe0d7412971cE6c', // BSquare uBTC Collateral
    ],
    pellStrategyVaultsV2: [
      {
        address: '0x1F745AEC91A7349E4F846Ae1D94915ec4f6cF053',
        fromBlock: 11581100,
      }
    ]
  }),
}