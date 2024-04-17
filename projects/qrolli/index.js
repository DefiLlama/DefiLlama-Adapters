const ADDRESSES = require("../helper/coreAssets.json");

const BitsHub = "0x64af2e5b1f6c0194adc5a0f17bc566a6d30f21e1";
const WMATIC = ADDRESSES.polygon.WMATIC;

async function polygonTvl(_, _1, _2, { api }) {
  const _length = await api.call({
    abi: "function getBitsLength() external view returns (uint256)",
    target: BitsHub,
    params: [],
  }); // Get Total Bits Contracts Counts

  let addressCalls = [];
  for (let i = 0; i < _length; i++) {
    addressCalls = [...addressCalls, { target: BitsHub, params: [i] }];
  }

  const _addresses = await api.multiCall({
    abi: "function bitsClones(uint256) external view returns (address)",
    calls: addressCalls,
  }); // Fetch All Bits Contracts Addresses

  const poolEthBalanceCalls = _addresses.map((_address) => {
    return { target: _address, params: [] };
  });

  const _poolEthBalances = await api.multiCall({
    abi: "function poolEthBalance() external view returns (uint256)",
    calls: poolEthBalanceCalls,
  }); // Fetch All MATIC balances of Bits Contracts

  for (let i = 0; i < _length ; i ++) {
    api.add(WMATIC, _poolEthBalances[i]); // For MATIC Balance
    api.add(WMATIC, _poolEthBalances[i]); // For Token Balance
  }
}

module.exports = {
  polygon: { tvl: polygonTvl },
};
