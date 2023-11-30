
const ADDRESSES = require('../helper/coreAssets.json')

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

async function tvl() {
  const { api } = arguments[3]
  const { userManager, DAI, uDAI } = config[api.chain]
  const bals = await api.batchCall([
    { target: userManager, abi: abi.totalStaked },
    { target: uDAI, abi: abi.totalRedeemable },
    { target: uDAI, abi: abi.totalReserves },
  ])
  bals.forEach(i => api.add(DAI, i))
}

async function borrowed() {
  const { api } = arguments[3]
  const { DAI, uDAI } = config[api.chain]
  const borrows = await api.call({ target: uDAI, abi: abi.totalBorrows, })
  api.add(DAI, borrows)
}

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used to underwrite or to borrow. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl, borrowed,
  }
})
