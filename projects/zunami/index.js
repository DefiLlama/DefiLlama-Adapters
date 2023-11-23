const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");

const zunamiContract = "0x2ffCC661011beC72e1A9524E12060983E74D14ce";
const zethOmnipoolContract = "0x9dE83985047ab3582668320A784F6b9736c6EEa7";

async function ethTvl(timestamp, block, _, { api }) {
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: abi.totalHoldings, target: zunamiContract, }))
  api.add(ADDRESSES.null, await api.call({ abi: abi.totalHoldings, target: zethOmnipoolContract, }))
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  hallmarks: [
    [Math.floor(new Date('2023-08-13')/1e3), 'Project was hacked for $2M'],
  ],
  methodology: "Total value of digital assets that are locked in Zunami Omnipools",
};