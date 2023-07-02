const CHOKE_CONTRACT = "0x6Fc2680D8ad8e8312191441B4ECa9EfF8D06b45a";
const LCHOKE_CHOKE_VAULT = "0x19E9d018AeC1c92EAC665aE73d39A264F1bBB5A3";

async function tvl(_, _1, _2, { api }) {
  const underlyingBalance = await api.call({
    abi: "erc20:balanceOf",
    target: CHOKE_CONTRACT,
    params: [LCHOKE_CHOKE_VAULT],
  });

  api.add(CHOKE_CONTRACT, underlyingBalance);
}

module.exports = {
  methodology: "counts the number of CHOKE staked in lChoke vault.",
  start: 1688146665,
  arbitrum: {
    tvl,
  },
};
