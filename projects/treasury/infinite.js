const { treasuryExports, nullAddress } = require("../helper/treasury");

const DAO_SAFE = "0xb5dB6e5a301E595B76F40319896a8dbDc277CEfB";
const DAO_GAS_WALLET = "0x1E2cD0E5905AFB73a67c497D82be271Cc65302Eb";
const VELODROME_RELAYER = "0x865e21A07d0915b72488860c3f3961f25e2c9347";
const ITP_VELO_LP = "0xC04754F8027aBBFe9EeA492C9cC78b66946a07D1";

const treasury = treasuryExports({
  ethereum: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
  },
  optimism: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
  },
  base: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
  },
  arbitrum: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
  },
  polygon: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
  },
});

const optimismTvl = treasury.optimism.tvl;

treasury.optimism.tvl = async (api) => {
  await optimismTvl(api);
  // Count only DAO-owned relayer deposits, not aggregate user deposits in the relayer.
  const daoRelayerBalance = await api.call({
    target: VELODROME_RELAYER,
    abi: "erc20:balanceOf",
    params: [DAO_SAFE],
  });
  api.add(ITP_VELO_LP, daoRelayerBalance);
  return api.getBalances();
};

module.exports = treasury;
