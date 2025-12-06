const CHUSD = "0x22222215d4Edc5510d23D0886133E7eCE7f5fdC1";
const SCHUSD = "0x888888bAb58a7Bd3068110749bC7b63B62Ce874d";

const abi = {
  totalAssets: "uint256:totalAssets",
  previewRedeem: "function previewRedeem(uint256 shares) view returns (uint256)",
};

const WAD = 10n ** 18n;

function toNumber(value, decimals = 18) {
  if (!value) return 0;
  const divisor = 10 ** decimals;
  return Number(value) / divisor;
}

async function chusdSupply(api) {
  const rawSupply = await api.call({ target: CHUSD, abi: "erc20:totalSupply" });
  const totalSupply = BigInt(rawSupply);
  api.addCGToken("usd", toNumber(totalSupply));
}

async function schusdMetrics(api) {
  const [totalSupply, totalAssets, previewRedeem] = await Promise.all([
    api.call({ target: SCHUSD, abi: "erc20:totalSupply" }),
    api.call({ target: SCHUSD, abi: abi.totalAssets }),
    api.call({ target: SCHUSD, abi: abi.previewRedeem, params: [WAD] }).catch(() => null),
  ]);

  const supply = BigInt(totalSupply);
  const assets = BigInt(totalAssets);
  const preview = previewRedeem ? BigInt(previewRedeem) : null;

  api.addCGToken("usd", toNumber(assets));

  const impliedPrice =
    supply === 0n ? WAD : (assets * WAD) / supply;
  const sharePrice = preview ?? impliedPrice;
  api.meta ??= {};
  api.meta.schusdPrice = Number(sharePrice) / 1e18;
}

async function tvl(api) {
  await chusdSupply(api);
}

async function staking(api) {
  await schusdMetrics(api);
}

module.exports = {
  timetravel: true,
  methodology:
    "chUSD TVL is tracked via totalSupply(). schUSD staking TVL uses totalAssets() (chUSD held in the ERC-4626 vault).",
  plasma: {
    tvl,
    staking,
  },
};
