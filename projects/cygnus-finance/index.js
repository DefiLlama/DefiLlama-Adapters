const CGUSD_CONTRACT = "0xCa72827a3D211CfD8F6b00Ac98824872b72CAb49";
const START_TIME = 1708351200;

async function tvl(api) {
  await api.erc4626Sum({ calls: [CGUSD_CONTRACT], balanceAbi: 'getTotalPooledAssets', tokenAbi: "asset" });
}

module.exports = {
  methodology: "Calculates the total cgUSD Supply",
  start: START_TIME,
  base: {
    tvl,
  },
};
