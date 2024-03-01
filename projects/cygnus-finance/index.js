const CGUSD_CONTRACT = "0xCa72827a3D211CfD8F6b00Ac98824872b72CAb49";
const START_TIME = 1708351200;

async function tvl(timestamp, block, _, { api }) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: CGUSD_CONTRACT,
  });

  const decimals = await api.call({
    abi: "erc20:decimals",
    target: CGUSD_CONTRACT,
  });

  return {
    "usd-coin": totalSupply / 10 ** decimals,
  };
}

module.exports = {
  methodology: "Calculates the total cgUSD Supply",
  start: START_TIME,
  base: {
    tvl,
  },
};
