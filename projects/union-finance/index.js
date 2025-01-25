const ADDRESSES = require('../helper/coreAssets.json');
const methodologies = require('../helper/methodologies');

const config = {
  ethereum: {
    userManager: "0x49c910Ba694789B58F53BFF80633f90B8631c195",
    underlying: ADDRESSES.ethereum.DAI,
    uToken: "0x954F20DF58347b71bbC10c94827bE9EbC8706887",
  },
  arbitrum: {
    userManager: "0xb71F3D4342AaE0b8D531E14D2CF2F45d6e458A5F",
    underlying: ADDRESSES.arbitrum.DAI,
    uToken: "0x954F20DF58347b71bbC10c94827bE9EbC8706887",
  },
  optimism: {
    userManager: "0x8E195D65b9932185Fcc76dB5144534e0f3597628",
    underlying: ADDRESSES.optimism.DAI,
    uToken: "0xE478b5e7A423d7CDb224692d0a816CA146A744b2",
  },
  base: {
    userManager: "0xfd745A1e2A220C6aC327EC55d2Cb404CD939f56b",
    underlying: ADDRESSES.base.USDC,
    uToken: "0xc2447f36FfdA08E278D25D08Ea91D942f0C2d6ea",
  },
};

const abi = {
  totalStaked: "uint256:totalStaked",
  totalRedeemable: "uint256:totalRedeemable",
  totalReserves: "uint256:totalReserves",
  totalBorrows: "uint256:totalBorrows",
};

async function tvl(api) {
  const { userManager, underlying, uToken } = config[api.chain]
  const bals = await api.batchCall([
    { target: userManager, abi: abi.totalStaked },
    { target: uToken, abi: abi.totalRedeemable },
    { target: uToken, abi: abi.totalReserves },
  ])
  bals.forEach(i => api.add(underlying, i))
}

async function borrowed(api) {
  const { underlying, uToken } = config[api.chain]
  const borrows = await api.call({ target: uToken, abi: abi.totalBorrows, })
  api.add(underlying, borrows)
}

module.exports = {
  methodology: methodologies.lendingMarket,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl, borrowed,
  }
})
