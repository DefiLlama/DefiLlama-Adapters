const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const OTSEA_TOKEN = "0x5dA151B95657e788076D04d56234Bd93e409CB09";
const OTSEA_MARKET_CONTRACT = "0x6E8B67B315b44519f8C2BEfdbbE11097c45353b4";
const OTSEA_STAKING_CONTRACT = "0xF2c8e860ca12Cde3F3195423eCf54427A4f30916";

const CONFIG = {
  ethereum: '0x6E8B67B315b44519f8C2BEfdbbE11097c45353b4',
  base: '0xa836Af59d35B3Da3c9FB5cFD6F84d9E3bD8c5fd5',
  blast: '0xa836Af59d35B3Da3c9FB5cFD6F84d9E3bD8c5fd5'
}

const abis = {
  getOrder: "function getOrder(uint72 _orderID) view returns ((address creator, uint8 orderType, uint8 state, uint8 feeType, bool isAON, bool isHidden, bool withLockUp, address token, uint256 totalInput, uint256 inputTransacted, uint256 totalOutput, uint256 outputTransacted) order)",
  getTotalOrders: "function getTotalOrders() view returns (uint72)",
}

const tvl = async (api) => {
  const factory = CONFIG[api.chain]
  const orders = await api.fetchList({ itemAbi: abis.getOrder, lengthAbi: abis.getTotalOrders, target: factory, startFromOne: true })
  for (const { orderType, state, totalOutput, outputTransacted } of orders) {
    if (orderType === '1' && state === '0') {
      const balance = totalOutput - outputTransacted;
      api.add(ADDRESSES.null, balance);
    }
  }

  await api.sumTokens({ owner: OTSEA_MARKET_CONTRACT, tokens: [ADDRESSES.null] });
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = {
    ...(module.exports[chain] || {}),
    ...(chain === 'ethereum' ? { staking: staking(OTSEA_STAKING_CONTRACT, OTSEA_TOKEN) } : {}),
    tvl,
  };
});