const VEPOCH_CONTRACT_ADDRESS = "0x731a2572b1cf56cfb804c74555715c8c8b5e980b";
const ITO_CONTRACT_ADDRESS = "0x44DE78EB54EE54C4151e62834D3B5a29005Bde98";

module.exports = {
  timetravel: true,
  doublecounted: true,
  start: 1700179200,
  hallmarks: [
    [1700179200, "vEPOCH Launch"],
    [1704240000, "ITO Launch"]
  ],
  ethereum: {
    tvl: async (_, _b, _cb, { api, }) => {
      await tvl_vEPOCH(api);
      await tvl_ITO(api);

      return api.balances;
    },
  },
  optimism: {
    tvl: async (_, _b, _cb, { api, }) => {
      await tvl_ITO(api);
      return api.balances;
    }
  },
  arbitrum: {
    tvl: async (_, _b, _cb, { api, }) => {
      await tvl_ITO(api);
      return api.balances;
    }
  },
  base: {
    tvl: async (_, _b, _cb, { api, }) => {
      await tvl_ITO(api);
      return api.balances;
    }
  }
};

async function tvl_ITO(api) {
  // Determine the total number of lp positions within the ITO protocol
  // then build a batch call to get all the info re lp positions
  const lpPositionsCount = await api.call(
    { abi: 'uint256:lpPositionsCount', target: ITO_CONTRACT_ADDRESS, params: [], chain: api.chain }
  );
  const calls = Array.from({ length: lpPositionsCount }, (_, i) => ({
    abi: 'function lpPositions(uint256) external view returns (address maker, uint16 lpFeeBp, uint32 startDate, uint32 endDate, address downsideToken, address upsideToken, uint256 upsideTokenBalance, uint256 upsidePerDownside, uint256 downsideTokenBalance)',
    target: ITO_CONTRACT_ADDRESS,
    params: [i],
    chain: api.chain
  }));

  // Perform the call and add these tokens and their associated balances to TVL
  const lpPositions = await api.batchCall(calls);
  lpPositions.forEach(({ upsideToken, downsideToken, upsideTokenBalance, downsideTokenBalance }) => {
    api.addToken(upsideToken, upsideTokenBalance);
    api.addToken(downsideToken, downsideTokenBalance);
  });

  // @dev note this tvl does not include fees generated
  // @dev also note, this TVL is not double counted
}

async function tvl_vEPOCH(api) {
  // Retrieve the Deposit and Reward token addresses from the vEPOCH contract
  const tokenAddresses = await api.batchCall([
    { abi: 'address:depositToken', target: VEPOCH_CONTRACT_ADDRESS, params: [], chain: api.chain },
    { abi: 'address:rewardToken', target: VEPOCH_CONTRACT_ADDRESS, params: [], chain: api.chain },
  ]);
  // Retrieve the balances of above tokens inside the vEPOCH contract
  const tokenAmounts = await api.batchCall([
    { abi: 'erc20:balanceOf', target: tokenAddresses[0], params: [VEPOCH_CONTRACT_ADDRESS], chain: api.chain },
    { abi: 'erc20:balanceOf', target: tokenAddresses[1], params: [VEPOCH_CONTRACT_ADDRESS], chain: api.chain },
  ]);
  // Add these balances and associated token addresses to TVL
  api.addTokens(tokenAddresses, tokenAmounts);

  return api.balances;
}