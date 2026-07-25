const APX_STAKING = "0x00b6792ac02caf607d0b6ea4a6f572a83472412f";
const APX_TOKEN   = "0x42523E3e454B97ff8651926685aFAD61C950Ab2F";

async function tvl(api) {
  const totalStaked = await api.call({
    abi:    "uint256:totalStaked",
    target: APX_STAKING,
  });
  api.add(APX_TOKEN, totalStaked);
}

module.exports = {
  methodology:
    "Tracks APX tokens actively staked by users in the USDAX Finance APXStaking contract on Robinhood Chain Mainnet. " +
    "Only active stake (accruing rewards) is counted — cooldown positions and the protocol reward pool are excluded.",
  robinhoodchain: {
    tvl,
    staking: tvl,
  },
};
