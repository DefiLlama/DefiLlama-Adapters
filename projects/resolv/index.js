const eth_tokens = [
  '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
  '0x4956b52aE2fF65D74CA2d61207523288e4528f96'  // RLP
];

const eth_token_lockboxes = [
  '0xD2eE2776F34Ef4E7325745b06E6d464b08D4be0E', // USR,
  '0x234C908E749961d0329a0eD5916d55a99d1aD06c' // RLP
];

const base_tokens = [
  '0x35E5dB674D8e93a03d814FA0ADa70731efe8a4b9', // USR
  '0xC31389794Ffac23331E0D9F611b7953f90AA5fDC' // RLP
];

async function ethTVL(api) {
  const supplies = await api.multiCall({ calls: eth_tokens, abi: 'erc20:totalSupply' });

  const eth_token_to_lockbox = Object.fromEntries(
    eth_tokens.map((token, i) => [token, eth_token_lockboxes[i]])
  );
  const lockbox_balances = await api.multiCall({
    calls: Object.entries(eth_token_to_lockbox).map(([token, lockbox]) => {
      return {
        target: token,
        params: [lockbox]
      };
    }),
    abi: 'erc20:balanceOf'
  });

  supplies.forEach((supply, i) => {
    const lockbox_balance = lockbox_balances[i];
    api.add(eth_tokens[i], supply - lockbox_balance);
  });
}

module.exports = {
  ethereum: { tvl: async (api) => ethTVL(api) },
  base: {
    tvl: async (api) => api.add(base_tokens, await api.multiCall({ calls: base_tokens, abi: 'erc20:totalSupply'}))
  }
};
