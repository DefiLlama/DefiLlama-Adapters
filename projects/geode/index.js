const PORTAL = {
  address: "0x4fe8C658f268842445Ae8f95D4D6D8Cfd356a8C8"
};

async function avax(api) {

  const planetType = 5;
  const planetIds = await api.call({ target: PORTAL.address, params: planetType, abi: 'function getIdsByType(uint256 _type) view returns (uint256[])', })


  // Find hosted derivative total Supplies, multiply with pricePerShare
  const supplies = await api.multiCall({ calls: planetIds, target: "0x6026a85e11bd895c934af02647e8c7b4ea2d9808", abi: "function totalSupply(uint256 id) view returns (uint256)", })
  const prices = await api.multiCall({ calls: planetIds, target: "0x6026a85e11bd895c934af02647e8c7b4ea2d9808", abi: "function pricePerShare(uint256 _id) view returns (uint256)", })

  supplies.forEach((supply, i) => api.addGasToken(supply * prices[i] / 1e18))

  // Find DWP addresses and count only Avax(index:0) balances, excluding gAVAX(index:1) balances
  const dwpAddresses = await api.multiCall({ calls: planetIds, target: PORTAL.address, abi: 'function planetWithdrawalPool(uint256 _id) view returns (address)', })
  const dwpOwnedIdle = await api.multiCall({ calls: dwpAddresses.map((dwpOfId) => ({ target: dwpOfId, params: 0, })), abi: 'function getTokenBalance(uint8 index) view returns (uint256)', })
  api.addGasToken(dwpOwnedIdle)
}

module.exports = {
  methodology:
    "All Staking Derivatives are included to the TVL with relative underlying price. Also counted the Avax within the Dynamic Withdrawal Pools.",
  doublecounted: true,
  hallmarks: [[1658869201, "Launch of yyAVAX"]],
  avax: {
    tvl: avax,
  },
};
