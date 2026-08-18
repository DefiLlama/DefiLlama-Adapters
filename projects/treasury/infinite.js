const { treasuryExports, nullAddress } = require("../helper/treasury");

const DAO_SAFE = "0xb5dB6e5a301E595B76F40319896a8dbDc277CEfB";
const DAO_GAS_WALLET = "0x1E2cD0E5905AFB73a67c497D82be271Cc65302Eb";
const VELODROME_RELAYER = "0x865e21A07d0915b72488860c3f3961f25e2c9347";
const ITP_VELO_LP = "0xC04754F8027aBBFe9EeA492C9cC78b66946a07D1";
const DHT_ETHEREUM = "0xca1207647ff814039530d7d35df0e1dd2e91fa84";
const DHT_ARBITRUM = "0x8038f3c971414fd1fc220ba727f2d4a0fc98cb65";
const DHT_OPTIMISM = "0xaf9fe3b5ccdae78188b1f8b9a49da7ae9510f151";
const DHT_POLYGON = "0x8c92e38eca8210f4fcbf17f0951b198dd7668292";
const DHT_BASE = "0x54bc229d1cb15f8b6415efeab4290a40bc8b7d84";
const AUTO_COMPOUNDER_VAULTS = [
  { vault: "0x569D92f0c94C04C74c2f3237983281875D9e2247", lp: "0xC04754F8027aBBFe9EeA492C9cC78b66946a07D1" }, // ITP/VELO
  { vault: "0xFCEa66a3333a4A3d911ce86cEf8Bdbb8bC16aCA6", lp: "0x3d5cbc66c366a51975918a132b1809c34d5c6fa2" }, // ITP/DHT
  { vault: "0x2811a577cf57A2Aa34e94B0Eb56157066717563f", lp: "0xdAD7B4C48b5B0BE1159c674226BE19038814eBf6" }, // ITP/wstETH
  { vault: "0x8A2e22BdA1fF16bdEf27b6072e087452fa874b69", lp: "0x79F1af622FE2C636a2d946F03A62D1DfC8cA6de4" }, // ITP/OP
  { vault: "0x3092F8dE262F363398F15DDE5E609a752938Cc11", lp: "0x93e40C357C4Dc57b5d2B9198a94Da2bD1C2e89cA" }, // ITP/WBTC
  { vault: "0xC4628802a42F83E5bce3caB05A4ac2F6E485F276", lp: "0x7e019a99f0dee5796db59c571ae9680c9c866a8e" }, // ITP/USDC
];

const treasury = treasuryExports({
  ethereum: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
    ownTokens: [DHT_ETHEREUM],
  },
  optimism: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
    ownTokens: [DHT_OPTIMISM],
  },
  base: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
    ownTokens: [DHT_BASE],
  },
  arbitrum: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
    ownTokens: [DHT_ARBITRUM],
  },
  polygon: {
    tokens: [nullAddress],
    owners: [DAO_SAFE, DAO_GAS_WALLET],
    ownTokens: [DHT_POLYGON],
  },
});

const optimismTvl = treasury.optimism.tvl;

treasury.optimism.tvl = async (api) => {
  await optimismTvl(api);

  // DAO share tokens in acITP vaults represent claim on growing LP principal.
  // Convert DAO shares into current underlying LP exposure so compounding growth is reflected.
  for (const { vault, lp } of AUTO_COMPOUNDER_VAULTS) {
    const [daoShares, totalShares, vaultLpBalance] = await api.batchCall([
      { target: vault, abi: "erc20:balanceOf", params: DAO_SAFE },
      { target: vault, abi: "erc20:totalSupply" },
      { target: vault, abi: "uint256:balance" },
    ]);
    if (!totalShares || !daoShares || !vaultLpBalance) continue;
    const daoLpBalance = daoShares * vaultLpBalance / totalShares;
    if (!daoLpBalance) continue;
    api.removeTokenBalance(vault);
    api.add(lp, daoLpBalance);
  }

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
