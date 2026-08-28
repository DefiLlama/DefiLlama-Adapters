const ADDRESSES = require('../helper/coreAssets.json')
const CONTRACTS = {
  plume: {
    FVH_contract: "0x4b87dF81A498ed204590f9aF25b8889cd0cBC5f7",
    pUsd: ADDRESSES.plume_mainnet.pUSD,
  },
  botanix: {
    FVH_contract: "0x81f1C1521DdCA5efA45d96c51384098E8AB1C916",
    pUsd: "0x42725b4D9270CFe24F6852401fdDa88248CB4dE9",
  },
};

async function tvl(api, chainName) {
  const { FVH_contract, pUsd } = CONTRACTS[chainName];

  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: pUsd,
    params: [FVH_contract],
  });

  api.add(pUsd, balance);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL counts the amount of pUsd locked in FVH_contract on each chain.",
  start: 1, 

  plume_mainnet: {
    tvl: async (api) => tvl(api, "plume"),
  },
  btnx: {
    tvl: async (api) => tvl(api, "botanix"),
  },
};
