const abi = {
  "underlyer": "address:underlyer",
}

const liquidityContracts = [
  // DAI Liquidity
  "0x75CE0E501e2E6776FcAAa514f394a88a772A8970",
  // USDC Liquidity
  "0xe18b0365D5D09F394f84eE56ed29DD2d8D6Fba5f",
  // USDT Liquidity
  "0xeA9c5a2717D5Ab75afaAC340151e73a7e37d99A7",
];

const ethTvl = async (api) => {
  const underlyers = await api.multiCall({ abi: abi.underlyer, calls: liquidityContracts })
  return api.sumTokens({ tokensAndOwners2: [underlyers, liquidityContracts]})
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  methodology: `The TVL for APY.Finance can be found in three contract addresses. Each address corresponds to the type of token that can be deposited, DAI, USDC, and USDT. After having the balance for each address, they are simply added together to get the total TVL.`
};
