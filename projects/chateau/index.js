const config = {
  plasma: {
    CHUSD: "0x22222215d4Edc5510d23D0886133E7eCE7f5fdC1",
    SCHUSD: "0x888888bAb58a7Bd3068110749bC7b63B62Ce874d",
  },
  hype: {
    CHUSD: "0x2222227d90046F1483B3Fb37990DEA31FCaBea02",
    SCHUSD: "0x888888facb316879129e1eEE2451260e44b93Aa8",
  },
};

const WAD = 10n ** 18n;

async function chusdSupply(api, CHUSD) {
  const totalSupply = await api.call({ target: CHUSD, abi: "erc20:totalSupply" });
  api.addCGToken("usd", Number(totalSupply) / 1e18);
}

async function schusdMetrics(api, SCHUSD) {
  const [totalSupply, totalAssets, previewRedeem] = await Promise.all([
    api.call({ target: SCHUSD, abi: "erc20:totalSupply" }),
    api.call({ target: SCHUSD, abi: "uint256:totalAssets" }),
    api.call({ target: SCHUSD, abi: "function previewRedeem(uint256 shares) view returns (uint256)", params: [WAD] }).catch(() => null),
  ]);

  api.addCGToken("usd", Number(totalAssets) / 1e18);

  const supply = BigInt(totalSupply);
  const assets = BigInt(totalAssets);
  const impliedPrice = supply === 0n ? WAD : (assets * WAD) / supply;
  const sharePrice = previewRedeem ? BigInt(previewRedeem) : impliedPrice;

  api.meta ??= {};
  api.meta.schusdPrice = Number(sharePrice) / 1e18;
}

module.exports = {
  timetravel: true,
  methodology:
    "chUSD TVL is tracked via totalSupply(). schUSD staking TVL uses totalAssets() (chUSD held in the ERC-4626 vault).",
};

Object.keys(config).forEach((chain) => {
  const { CHUSD, SCHUSD } = config[chain];
  module.exports[chain] = {
    tvl: (api) => chusdSupply(api, CHUSD),
    staking: (api) => schusdMetrics(api, SCHUSD),
  };
});
