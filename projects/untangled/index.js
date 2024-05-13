const {BigNumber} = require("bignumber.js");

const Contracts = {
  SecuritizationManager: "0x4DCC7a839CE7e952Cd90d03d65C70B9CCD6BA4C2",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
};

async function tvl(api) {
  const poolLength = await api.call({  abi: 'function getPoolsLength() view returns (uint256)', target: Contracts.SecuritizationManager })
  const poolsTVL = []
  let tvl = BigNumber(0)
  for (let i = 0; i < poolLength; i++) {
    const poolAddress = await api.call({ abi: 'function pools(uint256 i) view returns (address)', target: Contracts.SecuritizationManager, params: [i]})
    const reserves = await api.call({abi : 'function getReserves() external view returns (uint256, uint256)', target: poolAddress})
    const poolTVL = BigNumber(reserves[0]).plus(BigNumber(reserves[1]))
    tvl = tvl.plus(poolTVL)
  }
  return {
    'celo:0xcebA9300f2b948710d2653dD7B07f33A8B32118C': Number(tvl),
  }
}

module.exports = {
  celo: {
    tvl,
  },
};
