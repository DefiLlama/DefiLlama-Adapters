
const ADDRESSES = require('../helper/coreAssets.json');
const methodologies = require('../helper/methodologies');

const config = {
  ethereum: {
    userManager: "0x49c910Ba694789B58F53BFF80633f90B8631c195",
    DAI: ADDRESSES.ethereum.DAI,
    uDAI: "0x954F20DF58347b71bbC10c94827bE9EbC8706887",
  },
  arbitrum: {
    userManager: "0xb71F3D4342AaE0b8D531E14D2CF2F45d6e458A5F",
    DAI: ADDRESSES.optimism.DAI,
    uDAI: "0x954F20DF58347b71bbC10c94827bE9EbC8706887",
  },
  optimism: {
    userManager: "0x8E195D65b9932185Fcc76dB5144534e0f3597628",
    DAI: ADDRESSES.optimism.DAI,
    uDAI: "0xE478b5e7A423d7CDb224692d0a816CA146A744b2",
  },
};

const abi = {
  totalStaked: "uint256:totalStaked",
  totalRedeemable: "uint256:totalRedeemable",
  totalReserves: "uint256:totalReserves",
  totalBorrows: "uint256:totalBorrows",
};

async function tvl(api) {
  const { userManager, DAI, uDAI } = config[api.chain]
  const bals = await api.batchCall([
    { target: userManager, abi: abi.totalStaked },
    { target: uDAI, abi: abi.totalRedeemable },
    { target: uDAI, abi: abi.totalReserves },
  ])
  bals.forEach(i => api.add(DAI, i))
}

async function borrowed(api) {
  const { DAI, uDAI } = config[api.chain]
  const borrows = await api.call({ target: uDAI, abi: abi.totalBorrows, })
  api.add(DAI, borrows)
}

module.exports = {
  methodology: methodologies.lendingMarket,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl, borrowed,
  }
})
