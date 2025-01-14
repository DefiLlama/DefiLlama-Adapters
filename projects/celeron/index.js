const FARM_ADDRESS = "0x3384D85EC14163a9d35eeAb44261390aafD70f82";
const FARM_IONIC_ADDRESS = "0x8D25067901B637D0eF1DF3163D782d89d53F403A";
const CEL_ADDRESS = "0x8b83ECC4EF8FaEc5c05b7D6EC002B659BE137120";

async function tvl(api) {
  let pools = await api.call({ abi: abiInfo.poolTvls, target: FARM_IONIC_ADDRESS });
  pools.forEach(i => api.add(i.assets, i.tvl));
}

async function staking(api) {
  let pools = await api.call({ abi: abiInfo.poolTvls, target: FARM_ADDRESS });
  let target = pools.find((i) => i.assets === CEL_ADDRESS);
  api.add(CEL_ADDRESS, target.tvl);
}

module.exports = {
  mode: { tvl, staking, },
};

const abiInfo = {
  poolTvls:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
};
