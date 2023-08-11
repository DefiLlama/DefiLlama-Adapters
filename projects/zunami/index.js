const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");

const zunamiContract = "0x2ffCC661011beC72e1A9524E12060983E74D14ce";
const zunamiApsContract = "0xCaB49182aAdCd843b037bBF885AD56A3162698Bd";
const zethOmnipoolContract = "0x9dE83985047ab3582668320A784F6b9736c6EEa7";
const zethApsContract = "0x8fc72dcfbf39FE686c96f47C697663EE08C78380"

async function ethTvl(timestamp, block, _, { api }) {
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: abi.totalHoldings, target: zunamiContract, }))
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: abi.totalHoldings, target: zunamiApsContract, }))
  api.add(ADDRESSES.null, await api.call({ abi: abi.totalHoldings, target: zethOmnipoolContract, }))
  api.add(ADDRESSES.null, await api.call({ abi: abi.totalHoldings, target: zethApsContract, }))
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Total value of digital assets that are locked in Zunami Omnipools",
};