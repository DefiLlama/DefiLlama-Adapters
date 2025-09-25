const CONTRACTS = {
  plume: {
    FVH_contract: "0x4b87dF81A498ed204590f9aF25b8889cd0cBC5f7",
    pUsd: "0xdddD73F5Df1F0DC31373357beAC77545dC5A6f3F",
  },
};

async function tvl(api, chainName) {
  const { FVH_contract, pUsd } = CONTRACTS[chainName];

  // get pUsd balance held by FVH_contract
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: pUsd,
    params: [FVH_contract],
  });

  // add to balances
  api.add(pUsd, balance);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL counts the amount of pUsd locked in FVH_contract on each chain.",
  start: 1, // replace with your launch block if known

  plume: {
    tvl: async (api) => tvl(api, "plume"),
  },
};
