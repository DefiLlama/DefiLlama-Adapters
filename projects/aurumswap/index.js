const ARM     = "0xAEb0EB3628eAE1B36Ac94FE1033530342ADE0E26";
const STAKING = "0x02Ef1BAD5aac23366A94110517d46cE4EAb7351C";

async function staking(api) {
  const totalStaked = await api.call({ target: STAKING, abi: "uint256:totalStaked" });
  api.add(ARM, totalStaked);
}

module.exports = {
  methodology:
    "TVL is the ARM principal staked by users in the Aurum staking pool. Read from the on-chain `totalStaked()` accumulator on the staking contract, which excludes the rewards bucket. ARM is the protocol's native token, so the figure is reported under the `staking` bucket.",
  bsc: {
    tvl: () => ({}),
    staking,
  },
};
