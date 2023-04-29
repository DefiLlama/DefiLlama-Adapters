const defisaverABIs = require("./config/defisaver/abis");
const utils = require("./helper/utils");
const { nullAddress, } = require("./helper/tokenMapping");
const sdk = require('@defillama/sdk')

const dai = '0x6b175474e89094c44da98b954eedeac495271d0f'

const {
  CompoundSubscriptions,
  CompoundLoanInfo,
  McdSubscriptions,
  MCDSaverProxy,
  AaveSubscriptionsV2,
  AaveLoanInfoV2,
} = defisaverABIs;

function getAddress(defisaverConfig) {
  return defisaverConfig.networks['1'].address
}

function getAbi(defisaverConfig, abiName) {
  return defisaverConfig.abi[abiName]
}

// Utils
const bytesToString = (hex) =>
  Buffer.from(hex.replace(/^0x/, ""), "hex").toString().replace(/\x00/g, ""); // eslint-disable-line

const ilkToAsset = (ilk) =>
  (ilk.substr(0, 2) === "0x" ? bytesToString(ilk) : ilk).replace(/-.*/, "");

async function tvl(ts, block, _, { api }) {
  const balances = {}
  await Promise.all([
    getCompoundData,
    getAaveV2Data,
    getMakerData,
  ].map(i => i()))
  return balances

  async function getCompoundData() {
    let compoundSubs = await api.call({
      target: getAddress(CompoundSubscriptions),
      abi: getAbi(CompoundSubscriptions, 'getSubscribers'),
    })
    let subData = await api.call({
      target: getAddress(CompoundLoanInfo),
      abi: getAbi(CompoundLoanInfo, 'getLoanDataArr'),
      params: [compoundSubs.map((s) => s.user)],
    })
    subData.map((sub) => {
      const { collAmounts, collAddr, borrowAddr, borrowAmounts } = sub

      let borrowAmountTotal = 0
      borrowAddr.forEach((value, i) => {
        if (value === nullAddress) return;
        borrowAmountTotal += +borrowAmounts[i]
      })

      if (borrowAmountTotal <= 0) return;
      collAddr.forEach((value, i) => {
        if (value === nullAddress) return;
        sdk.util.sumSingleBalance(balances, dai, collAmounts[i], api.chain)
      })
    })
  }

  async function getAaveV2Data() {
    const defaultMarket = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
    let aaveSubs = await api.call({
      target: getAddress(AaveSubscriptionsV2),
      abi: getAbi(AaveSubscriptionsV2, 'getSubscribers'),
    })

    const chunks = utils.sliceIntoChunks(aaveSubs, 30)
    await Promise.all(chunks.map(async aaveSubs => {
      const subData = await api.call({
        target: getAddress(AaveLoanInfoV2),
        abi: getAbi(AaveLoanInfoV2, 'getLoanDataArr'),
        params: [defaultMarket, aaveSubs.map(i => i.user)],
      })
      subData.map((sub) => {
        const { collAmounts, collAddr, borrowAddr, borrowStableAmounts, borrowVariableAmounts, } = sub

        let borrowAmountTotal = 0
        borrowAddr.forEach((value, i) => {
          if (value === nullAddress) return;
          borrowAmountTotal += +borrowStableAmounts[i]
          borrowAmountTotal += +borrowVariableAmounts[i]
        })

        if (borrowAmountTotal <= 0) return;
        collAddr.forEach((value, i) => {
          if (value === nullAddress) return;
          sdk.util.sumSingleBalance(balances, nullAddress, collAmounts[i], api.chain)
        })

      })
    }))
  }

  async function getMakerData() {
    let makerSubs = await api.call({
      target: getAddress(McdSubscriptions),
      abi: getAbi(McdSubscriptions, 'getSubscribers'),
    })

    const getCdpDetailedInfoABI = getAbi(MCDSaverProxy, 'getCdpDetailedInfo')

    const calls = [];
    for (const cdp of makerSubs) {
      calls.push({
        target: getAddress(MCDSaverProxy),
        params: [cdp.cdpId,],
      });
    }
    const callResults = await api.multiCall({
      abi: getCdpDetailedInfoABI,
      calls,
    })

    callResults.forEach((cdp, i) => {
      const asset = ilkToAsset(cdp.ilk)
      if (+cdp.debt <= 0 || asset === 'RENBTC' ) return;
      let balance = cdp.collateral
      if (asset === 'WBTC')
        balance /= 1e10

      sdk.util.sumSingleBalance(balances, assetMapping[asset] || asset, balance)
    });
  }
}

const assetMapping = {
  ETH: nullAddress,
  DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
  BAT: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  RETH: '0xae78736cd615f374d3085123a210448e74fc6393',
  LINK: '0x514910771af9ca656af840dff83e8264ecf986ca',
  WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  MATIC: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  WSTETH: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl
  },
};
