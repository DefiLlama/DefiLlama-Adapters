const FACTORY = "0x78120F2C0EBF0cc8B7E7749e62D36e6523dD711D";

const abi = {
  getPoolsLength: "function getPoolsLength() view returns (uint256)",
  getPoolAt: "function getPoolAt(uint256 index) view returns (address)",
  getTokens: "function getTokens() view returns (address tokenX, address tokenY)",
  getBalances: "function getBalances() view returns (uint256 totalX, uint256 totalY)",
};

async function tvl(api) {
  const length = await api.call({ target: FACTORY, abi: abi.getPoolsLength });
  const pools = await api.multiCall({
    target: FACTORY,
    abi: abi.getPoolAt,
    calls: [...Array(Number(length)).keys()],
  });
  const tokens = await api.multiCall({ abi: abi.getTokens, calls: pools });
  const balances = await api.multiCall({ abi: abi.getBalances, calls: pools });
  tokens.forEach(({ tokenX, tokenY }, i) => {
    api.add(tokenX, balances[i].totalX);
    api.add(tokenY, balances[i].totalY);
  });
  return api.getBalances();
}

module.exports = {
  methodology:
    "Sum of tokenX + tokenY held by every POE OraclePool (getBalances), pools enumerated from the POE Factory registry (getPoolsLength / getPoolAt).",
  start: '2026-05-07',
  monad: { tvl },
};
