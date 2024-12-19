const { sumTokens2 } = require("../helper/unwrapLPs")
const { getLogs } = require("../helper/cache/getLogs");
const AssetConfigSettingEventABI = "event AssetConfigSetting(address asset,uint256 feeIn,uint256 feeOut,uint256 debtTokenMintCap,uint256 dailyMintCap,address oracle,bool isUsingOracle,uint256 swapWaitingPeriod,uint256 maxPrice,uint256 minPrice)";


function createExports({
  troveList,
  nymInformation, // { address, fromBlock }
  aaveStrategyVaults, // { address, asset, aToken }[]
  pellStrategyVaults, // { address, asset }[]
}) {
  return {
    tvl: async (api,_a,_b,chain) => {
      const chainKey = chain.storedKey;
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

      let otherAssets = []; // { key, amount }[]
      if(aaveStrategyVaults) {
        for(let index = 0; index < aaveStrategyVaults.length; index++) {
          const { address: vault, aToken, asset } = aaveStrategyVaults[index];
          const assetAmount = await api.call({
            abi: "erc20:balanceOf",
            target: aToken,
            params: [vault],
          });
          otherAssets.push({
            key: `${chainKey}:${asset}`,
            amount: assetAmount,
          });
        }
      }

      if(pellStrategyVaults) {
        for (let index = 0; index < pellStrategyVaults.length; index++) {
          const { address: vault, asset } = pellStrategyVaults[index];
          const pellStrategy = await api.call({
            abi: "function pellStrategy() external view returns (address)",
            target: vault,
          });
          const assetAmount = await api.call({
            abi: "function userUnderlyingView(address) external view returns (uint256)",
            target: pellStrategy,
            params: [vault],
          });
          otherAssets.push({
            key: `${chainKey}:${asset}`,
            amount: assetAmount,
          });
        }
      }

      const result = await sumTokens2({ api, tokensAndOwners2: [tokens, owners] })
      otherAssets.forEach(({ key, amount }) => {
        if(result[key]) {
          result[key] = (BigInt(result[key]) + BigInt(amount)).toString();
        } else {
          result[key] = amount;
        }
      });
      return result;
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
  }),
}
