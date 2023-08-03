const ADDRESSES = require('./helper/coreAssets.json')
const defisaverABIs = require("./config/defisaver/abis");
const utils = require("./helper/utils");
const { nullAddress, } = require("./helper/tokenMapping");
const sdk = require('@defillama/sdk')

const dai = ADDRESSES.ethereum.DAI

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
  DAI: ADDRESSES.ethereum.DAI,
  BAT: ADDRESSES.ethereum.BAT,
  RETH: ADDRESSES.ethereum.RETH,
  LINK: ADDRESSES.ethereum.LINK,
  WBTC: ADDRESSES.ethereum.WBTC,
  MATIC: ADDRESSES.ethereum.MATIC,
  WSTETH: ADDRESSES.ethereum.WSTETH
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl
  },
};
