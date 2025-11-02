const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

const sonic = {
  rzr: '0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5',
  depositContract: "0xe22e10f8246dF1f0845eE3E9f2F0318bd60EFC85",
  stakingContract: "0xd060499DDC9cb7deB07f080BAeB1aDD36AA2C650",
  tokenList: "0xe8cb54f2523ABa0FBD2Bbd11f979BE75bDfd9917",
}

const ethereum = {
  rzr: '0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5',
  depositContract: "0x0000030d7a7C4888851F35705B0852CF20Ac1bA6",
  stakingContract: "0xcD43c9c6ECCA33a0C3EF6E509f7559c5C5e46399",
  tokenList: "0xb68b2BeD621dcE656Ddcc607769fb6AAc3F67B5C",
}
const bsc = {
  rzr: '0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5',
  depositContract: "0x0000030d7a7C4888851F35705B0852CF20Ac1bA6",
  tokenList: "0x3B3c534D22dEEd568813AfA1b75996B8241126E0",
}

const hyperliquid = {
  rzr: '0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5',
  depositContract: "0x0000030d7a7C4888851F35705B0852CF20Ac1bA6",
  tokenList: "0xBf1607FDb610A246d957456cD844E228b6c712CE",
}

const base = {
  rzr: '0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5',
  depositContract: "0x0000030d7a7C4888851F35705B0852CF20Ac1bA6",
  tokenList: "0x06f9617E604019af5e28c9e2e75F0886bBdc03aE",
}

const tvl = (addresses) => async (api) => {
  const abi = 'function getTokens() external view returns (address[] memory)'
  const tokens = await api.call({ abi, target: addresses.tokenList });
  const toa = tokens.map(token => [token, addresses.depositContract])
  return api.sumTokens({ tokensAndOwners: toa })
}

const pool2 = (addresses) => async (api) => {
  const abi = 'function getLpTokens() external view returns (address[] memory)'
  const tokens = await api.call({ abi, target: addresses.tokenList });
  return sumTokens2({ api, tokens, owners: [addresses.depositContract], resolveLP: true })
}


const data = {
  sonic: {
    tvl: tvl(sonic),
    pool2: pool2(sonic),
    staking: staking(sonic.stakingContract, sonic.rzr, "sonic"),
  },
  ethereum: {
    tvl: tvl(ethereum),
    pool2: pool2(ethereum),
    staking: staking(ethereum.stakingContract, ethereum.rzr, "ethereum"),
  },
  base: {
    tvl: tvl(base),
    pool2: pool2(base),
  },
  bsc: {
    tvl: tvl(bsc),
    pool2: pool2(bsc),
  },
  hyperliquid: {
    tvl: tvl(hyperliquid),
    pool2: pool2(hyperliquid),
  },
};

module.exports = data;
