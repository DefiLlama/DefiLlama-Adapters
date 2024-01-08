const MINT_TOKEN_CONTRACT = "0xbe1Be54f6251109d5fB2532b85d7eE9Cb375C43f";

async function tvl(_, _1, _2, { api }) {
  const balance = await api.call({
    abi: "erc20:totalSupply",
    target: MINT_TOKEN_CONTRACT,
  });

  api.add(MINT_TOKEN_CONTRACT, balance);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Value of all Canto wrapped in CSR protocol",
  start: 4859484,
  canto: {
    tvl,
  },
};
