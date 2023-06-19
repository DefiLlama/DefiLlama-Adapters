const POOL = "0x587A7eaE9b461ad724391Aa7195210e0547eD11d";
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

async function tvl(_, _1, _2, { api }) {
  const totalBorrows = await api.call({    target: POOL,    abi: "uint256:totalBorrows",  });
    const totalReserves = await api.call({    target: POOL,    abi: "uint256:totalReserves",  });
    api.add(nullAddress, totalBorrows)
    api.add(nullAddress, totalReserves * -1)

  return sumTokens2({ api, owner: POOL, tokens: [nullAddress]});
}

module.exports = {
  methodology:
    "HashMix FIL Liquid Staking Protocol is a decentralized staking protocol on Filecoin, connecting FIL holders and miners in the ecosystem.",
  filecoin: {
    tvl,
  },
};
