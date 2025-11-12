const abi = require("./abi.json");

const addressProviders = [
  '0x139c15e21b0f6e43fc397face5de5b7d5ae6874a',
  '0xa298d39715AE492e4CAF3Ccb33cBF57abC5238d7',
]

async function tvl(api) {
  const strategies = await api.fetchList({  lengthAbi: abi.poolsCount, itemAbi: abi.getPoolAtIndex, calls: addressProviders})
  const tokens = await api.multiCall({  abi: abi.getUnderlying, calls: strategies})
  const deposits = await api.multiCall({  abi: abi.totalUnderlying, calls: strategies})
  api.add(tokens, deposits)
}

module.exports = {
  methodology: 'Counts the DAI and USDC that has been deposited into the protocol',
  ethereum: {
    tvl
  }
};