const { BigNumber } = require("bignumber.js");
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs")
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokensExport } = require('../helper/sumTokens.js')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const AssetConfigSettingEventV1ABI = "event AssetConfigSetting(address asset,uint256 feeIn,uint256 feeOut,uint256 debtTokenMintCap,uint256 dailyMintCap,address oracle,bool isUsingOracle,uint256 swapWaitingPeriod,uint256 maxPrice,uint256 minPrice)";
const VaultTokenStrategySetEventABI = "event TokenStrategySet(address token, address strategy)";
const GetEntireSystemCollABI = 'uint256:getEntireSystemColl';
const GetCollateralTokenABI = 'address:collateralToken';
const GetSmartVaultTotalDepositedUnderlyingABI = 'uint256:getTotalDepositedUnderlying';
const AssetConfigSettingEventV2ABI = "event AssetConfigSetting(address asset, tuple(uint256 feeIn, uint256 feeOut, uint256 debtTokenMintCap, uint256 dailyDebtTokenMintCap, uint256 debtTokenMinted, uint256 swapWaitingPeriod, uint256 maxPrice, uint256 minPrice, bool isUsingOracle) config)";

function createExports({
  troveList,
  nymList, // { address, fromBlock }[]
  nymV2List, // { address, fromBlock }[]
  farmList, // { address, asset }[]
  smartVaultList, // { address, fromBlock }[]
}) {
  return {
    tvl: async (api) => {
      const tokensAndOwners = []; // [address, address][]
      if (troveList) {
        await addCollateralBalanceFromTrove(api, troveList);
      }

      if (nymList) {
        await processNymList(api, nymList, tokensAndOwners, 'v1');
      }

      if (nymV2List) {
        await processNymList(api, nymV2List, tokensAndOwners, 'v2');
      }

      if (farmList) {
        processFarmList(farmList, tokensAndOwners);
      }

      if (smartVaultList) {
        await addSmartVaultList(api, smartVaultList);
      }

      api.addBalances(sumTokens2({ api, tokensAndOwners, }));
      return api.getBalances();
    },
  }
}

async function processNymList(api, nymList, tokensAndOwners, version = 'v2') {
  for (let i = 0; i < nymList.length; i++) {
    const { address: nymContractAddress, fromBlock } = nymList[i];
    const logs = 
     version === 'v1'
     ? await getLogs({ api, target: nymContractAddress, fromBlock, eventAbi: AssetConfigSettingEventV1ABI, onlyArgs: true })
     : await getLogs({ api, target: nymContractAddress, fromBlock, eventAbi: AssetConfigSettingEventV2ABI, onlyArgs: true })
    const assetList = logs.map(item => item.asset);
    assetList.forEach(asset => tokensAndOwners.push([asset, nymContractAddress]));
  }
}

function processFarmList(farmList, tokensAndOwners) {
  for (let index = 0; index < farmList.length; index++) {
    const { address: farmAddress, asset } = farmList[index];
    tokensAndOwners.push([asset, farmAddress])
  }
}

async function addCollateralBalanceFromTrove(api, troveList) {
  const balances = {};
  const chains = api.chain;
  const tokens = await api.multiCall({ abi: GetCollateralTokenABI, calls: troveList, permitFailure: true })
  const colls = await api.multiCall({ abi: GetEntireSystemCollABI, calls: troveList, permitFailure: true })
  tokens.forEach((token, i) => {
    if(!token) return;
    if(!colls[i]) return;
    const key = `${chains}:${token}`;
    if (!balances[key]) {
      balances[key] = new BigNumber(0);
    }
    balances[key] = balances[key].plus(colls[i]);
  });
  Object.keys(balances).forEach((key) => {
    if (balances[key].isZero()) {
      delete balances[key];
    } else {
      balances[key] = balances[key].toFixed(0);
    }
  });
  api.addBalances(balances);

  return {
    balances,
    tokens,
  };
}

async function addSmartVaultList(api, smartVaultList) {
  const chains = api.chain;
  const vaults = smartVaultList.map(t => t.smartVaultAddress);
  const tokens = smartVaultList.map(t => t.asset);
  const balances = {};
  const amounts = await api.multiCall({ abi: GetSmartVaultTotalDepositedUnderlyingABI, calls: vaults, permitFailure: true })

  tokens.forEach((token, i) => {
    if(!token) return;
    if(!amounts[i]) return;
    const key = `${chains}:${token}`;
    if (!balances[key]) {
      balances[key] = new BigNumber(0);
    }
    balances[key] = balances[key].plus(amounts[i]);
  });
  Object.keys(balances).forEach((key) => {
    if (balances[key].isZero()) {
      delete balances[key];
    } else {
      balances[key] = balances[key].toFixed(0);
    }
  });
  api.addBalances(balances);

  return {
    balances,
    tokens,
  };
}

module.exports = {
  bevm: createExports({
    troveList: [
      '0x0598Ef47508Ec11a503670Ac3B642AAE8EAEdEFA', // BEVM WBTC Collateral(V1)
      '0xa794a7Fd668FE378E095849caafA8C8dC7E84780', // BEVM wstBTC Collateral(V1)
      '0xe7E23aD9c455c2Bcd3f7943437f4dFBe9149c0D2', // BEVM WBTC Collateral(V2)
      '0xD63e204F0aB688403205cFC144CAdfc0D8C68458', // BEVM wstBTC Collateral(V2)
    ],
    nymList: [{
      address: '0xdd0bD4F817bDc108e31EE534931eefc855CAf7Df',
      fromBlock: 5081750,
    }],
    vaultManagerList: [
      {
        address: '0xcCFD19e331fFcE8506718ec3DddDDf9f23029825'
      }
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
    }, ],
    nymV2List: [{
      address: '0x95E5b977c8c33DE5b3B5D2216F1097C2017Bdf71',
      fromBlock: 8880614,
    }, ],
    vaultManagerList: [
      {
        address: '0x32db5c3D64aa7e100B73786000704aee61072981'
      }
    ],
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
    }],
    nymV2List: [{
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
    vaultManagerList: [
      {
        address: '0x954C6f00E361dA33c9b8E5f2660b2D4024a04634'
      }
    ],
    smartVaultList: [
      {
        smartVaultAddress: '0x3eeF93169c34F50919063eF56A118BFF26C8dfb8',
        asset: '0x4CBE838E2BD3B46247f80519B6aC79363298aa09', // satUniBTC
      },
      {
        smartVaultAddress: '0xd62E2F6b6616271001DCd0988AD2D73DEeE1b491',
        asset: ADDRESSES.bob.uniBTC, // uniBTC
      },
    ]
  }),
  bsquared: createExports({
    troveList: [
      '0xa79241206c3008bE4EB4B62A48A4F98303060D4f', // BSquare WBTC Collateral(V1)
      '0xc6F361db5eC432E95D0A08A9Fbe0d7412971cE6c', // BSquare uBTC Collateral(V1)
      '0x8FBfe28D6E5424d7f8c8c29A4910ce8a618d2D54', // WBTC Collateral(V2)
      '0xa03B86E93c98FE95caC2A6645fF271Bb67040eab', // uBTC Collateral(V2)
      '0xb38653A0190252487FC6502D1D7B41A9647fB84b', // uniBTC Collateral(V2)
    ],
    strategyVaultsV2: [
      {
        address: '0x1F745AEC91A7349E4F846Ae1D94915ec4f6cF053',
        fromBlock: 11581100,
      }
    ],
    vaultManagerList: [
      {
        address: '0x21d9a468196665AEc3d3c289EfF7BD5725507972'
      },
      {
        address: '0x03d9C4E4BC5D3678A9076caC50dB0251D8676872'
      },
    ],
    nymV2List: [{
      address: '0x2863E3D0f29E2EEC6adEFC0dF0d3171DaD542c02',
      fromBlock: 12871190,
    }],
  }),
  bsc: createExports({
    troveList: [
      '0xb655775C4C7C6e0C2002935133c950FB89974928', // WBTC Collateral(V2)
      '0x5EA26D0A1a9aa6731F9BFB93fCd654cd1C3079Ec', // BTCB Collateral(V2)
      '0xDAc0551246A7F75503e8C908456005E828C35A40', // SolvBTC Collateral(V2)
    ],
    vaultManagerList: [
      {
        address: '0xc473754a6e35cC4F45316F9faaeF0a3a86D90E4e'
      },
    ],
    nymV2List: [{
      address: '0x07BbC5A83B83a5C440D1CAedBF1081426d0AA4Ec',
      fromBlock: 46861855,
    }],
    smartVaultList: [
      {
        smartVaultAddress: '0x30349Af0cDcC2a93Ea4101953101BC0DEc43c53E',
        asset: '0x623F2774d9f27B59bc6b954544487532CE79d9DF', // bfBTC
      },
      {
        smartVaultAddress: '0x8f10C801B62Ae0b67B87B56a5f8ce05437ba6b7f',
        asset: '0x623F2774d9f27B59bc6b954544487532CE79d9DF', // bfBTC
      },
    ],
  }),
  hemi: createExports({
    troveList: [
      '0xb655775C4C7C6e0C2002935133c950FB89974928', // WETH Collateral(V2)
      '0x5EA26D0A1a9aa6731F9BFB93fCd654cd1C3079Ec', // HemiBTC Collateral(V2)
      '0xa7B54413129441e872F42C1c4fE7D1984332CA87', // WBTC Collateral(V2)
      '0xED6E49a1835A50a8FD5511704616B89845Ad5564', // iBTC Collateral(V2)
      '0x6d991Eb34321609889812050bC7f4604Eb0bfF26', // enzoBTC Collateral(V2)
      '0xDAc0551246A7F75503e8C908456005E828C35A40', // uBTC Collateral(V2)
    ],
    nymV2List: [{
      address: '0x07BbC5A83B83a5C440D1CAedBF1081426d0AA4Ec',
      fromBlock: 1191810,
    }],
  }),
  base: createExports({
    troveList: [
      '0xddac7d4e228c205197FE9961865FFE20173dE56B', // WETH Collateral(V2)
      '0x4B37F38DF39C9E6D876b830ED3FF444533Aa2E45', // WBTC Collateral(V2)
      '0x50B02283f3c39A463DF3d84d44d46b5432D7D193', // cbBTC Collateral(V2)
      '0x01DF7D28c51639F2f2F95dcF2FdFF374269327B0', // clBTC Collateral(V2)
    ],
    nymV2List: [{
      address: '0x9a3c724ee9603A7550499bE73DC743B371811dd3',
      fromBlock: 28842761,
    }],
    strategyVaultsV2: [
      {
        address: '0xE8c5b4517610006C1fb0eD5467E01e4bAd43558D',
        fromBlock: 29316928,
      }
    ],
    vaultManagerList: [
      {
        address: '0x9Dda31F8a07B216AB5E153456DE251E0ed2e6372'
      },
    ],
  }),
  arbitrum: createExports({
    troveList: [
      '0xb655775C4C7C6e0C2002935133c950FB89974928', // WETH Collateral(V2)
      '0x5EA26D0A1a9aa6731F9BFB93fCd654cd1C3079Ec', // WBTC Collateral(V2)
      '0xa7B54413129441e872F42C1c4fE7D1984332CA87', // clBTC Collateral(V2)
    ],
    nymV2List: [{
      address: '0x07BbC5A83B83a5C440D1CAedBF1081426d0AA4Ec',
      fromBlock: 330837414,
    }],
  }),
  sonic: createExports({
    troveList: [
      '0xb655775C4C7C6e0C2002935133c950FB89974928', // WETH Collateral(V2)
      '0x5EA26D0A1a9aa6731F9BFB93fCd654cd1C3079Ec', // WBTC Collateral(V2)
    ],
    nymV2List: [{
      address: '0x07BbC5A83B83a5C440D1CAedBF1081426d0AA4Ec',
      fromBlock: 33129825,
    }],
  }),
  xlayer: createExports({
    troveList: [
      '0xb655775C4C7C6e0C2002935133c950FB89974928', // WETH Collateral(V2) deprecated
      '0x5EA26D0A1a9aa6731F9BFB93fCd654cd1C3079Ec', // WBTC Collateral(V2) deprecated
      '0xbe223F331f05a8cf18F98675033FEFD6b23c7176', // WETH Collateral(V2)
      '0xd19BC6B110896d136D9456E8fD45C71C8d8C5abB', // WBTC Collateral(V2)
    ],
    nymV2List: [{
      address: '0x07BbC5A83B83a5C440D1CAedBF1081426d0AA4Ec', // deprecated
      fromBlock: 20436365,
    }, {
      address: '0xB4d4793a1CD57b6EceBADf6FcbE5aEd03e8e93eC',
      fromBlock: 32838540,
    }, ]
  }),
  ethereum: createExports({
    troveList: [
      '0xb655775C4C7C6e0C2002935133c950FB89974928', // WETH Collateral(V2) deprecated
      '0x5EA26D0A1a9aa6731F9BFB93fCd654cd1C3079Ec', // WBTC Collateral(V2) deprecated

      '0xb97E6219B0836E21ae671358e746f03dcdbCb6D8', // WETH Collateral(V2)
      '0xc03403DD8f27CEFA314Fc109D26777c81b0De895', // WBTC Collateral(V2)
      '0x2135EfEF5aC35ba549Cc791cEc4D15E8C8115611', // weETH Collateral(V2)
      '0x43891fa695f17E47C9b2A0DFD9fb48147d331934', // uniBTC Collateral(V2)
      '0x9644652540f78f9e27899a655067f205f9454a4a', // LBTC Collateral(V2)
    ],
    nymV2List: [{
      address: '0x07BbC5A83B83a5C440D1CAedBF1081426d0AA4Ec', // deprecated
      fromBlock: 23017053,
    }, {
      address: '0xb8374e4DfF99202292da2FE34425e1dE665b67E6',
      fromBlock: 23180734,
    }],
    smartVaultList: [
      {
        smartVaultAddress: '0xDd7eCb0dc1686020A8a23EE55126D7596a2eA03b',
        asset: '0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568', // uniBTC
      },
      {
        smartVaultAddress: '0x05EA42F72F2e627497423663Faf7b00eA7DdA2C1',
        asset: '0x8236a87084f8B84306f72007F36F2618A5634494', // LBTC
      },
    ],
  }),
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.river }),
  },
}

