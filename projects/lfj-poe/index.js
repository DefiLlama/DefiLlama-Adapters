const FACTORY = "0x78120F2C0EBF0cc8B7E7749e62D36e6523dD711D";

const abi = {
  getPoolsLength: "function getPoolsLength() view returns (uint256)",
  getPoolAt: "function getPoolAt(uint256 index) view returns (address)",
  getTokens: "function getTokens() view returns (address tokenX, address tokenY)",
};

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: abi.getPoolsLength, itemAbi: abi.getPoolAt, target: FACTORY });
  const tokens = await api.multiCall({ abi: abi.getTokens, calls: pools });

  await api.sumTokens({ tokens: tokens.flatMap(({ tokenX, tokenY }) => [tokenX, tokenY]), owners: pools });
}

module.exports = {
  methodology:
    "Sum of tokens held by each pool, enumerated from the POE Factory registry (getPoolsLength / getPoolAt).",
  start: '2026-05-07',
  monad: { tvl },
};
