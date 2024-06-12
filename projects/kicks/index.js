const STAKING = "0x7f435dC15CD9d686C48B6beD2cB8d32D895cfb93";
const TOKEN = "0xfEB4e9B932eF708c498Cc997ABe51D0EE39300cf";

async function staking(time, ethBlock, _b, { api }) {
  const supply = await api.call({
    abi: "function totalSupply() external view returns (uint256)",
    target: STAKING,
  });

  return api.add(TOKEN, supply)
}

module.exports = {
  methodology: "TVL counted from the KICKS contracts",
  bsc: {
    tvl: () => ({}),
    staking,
  },
};
