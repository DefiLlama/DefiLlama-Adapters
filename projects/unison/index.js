const abi = {
  getTotalTvl: "uint256:getTotalTvl",
};

const reader = "0xAaE1a15ca4c6dBAF3859953157727B0028da9fC0";
const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";  // USDC token on Polygon

async function tvl(api) {
  const totalTvl = await api.call({
    target: reader,
    abi: abi.getTotalTvl,
  });

  api.add(USDC, totalTvl);
}

module.exports = {
  polygon: {
    tvl,
  },
};