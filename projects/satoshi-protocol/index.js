const { sumTokens2 } = require("../helper/unwrapLPs")
const { getLogs } = require("../helper/cache/getLogs");
const AssetConfigSettingEventABI = "event AssetConfigSetting(address asset,uint256 feeIn,uint256 feeOut,uint256 debtTokenMintCap,uint256 dailyMintCap,address oracle,bool isUsingOracle,uint256 swapWaitingPeriod,uint256 maxPrice,uint256 minPrice)";


function createExports({
  troveList,
  nymInformation, // { address, fromBlock }
}) {
  return {
    tvl: async (api) => {
      const tokens = [];
      const owners = [];
      if(troveList) {
        owners.push(...troveList);
        const collaterals = await getCollateralsFromTrove(api, troveList);
        tokens.push(...collaterals);
      }

      if(nymInformation) {
        const assetList = await getAssetListFromNymContract(api, nymInformation.address, nymInformation.fromBlock);
        assetList.forEach(asset => {
          owners.push(nymInformation.address);
          tokens.push(asset);
        })
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
  const logs = await getLogs({api, target: nymContractAddress, fromBlock, eventAbi: AssetConfigSettingEventABI, onlyArgs: true});
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
    }
  }),
  bsquared: createExports({
    troveList: [
      '0xa79241206c3008bE4EB4B62A48A4F98303060D4f', // BSquare WBTC Collateral
      '0xc6F361db5eC432E95D0A08A9Fbe0d7412971cE6c', // BSquare uBTC Collateral
    ],
  }),
}
