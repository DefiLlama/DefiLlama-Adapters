const { sumTokens2 } = require("../helper/unwrapLPs");
const vaults = [
  // Infrared
  "0x813C9ecE1Da3B529656DfCc5D42815f9cCf60B2c",
  "0x9bC238c1e0f31a5e016Ea484a698Ee7B4c3B219c",
  "0x45114A8fCFa77967FDb33E87f6284fc119128836",
  "0x76BAe24B0fc180B98A613E3AF19F1A6AE8E4d4F4",
  "0xe88e01F2e3eb8E867Bf38E873DCC229264696098",
  "0x7c04723AB200D55d1C826160340c089E7CaAFEea",
  // Kodiak
  "0x69D08aaCd061B4054036BE42D6807cf669de13bd",
  "0x2C368aD56E801ed8E8590DF84Cb537E98f566460",
  "0x388FF9498b8d967DE373b4a440a7A54A34Ec2743",
  "0xf279F04E3976cc9b32A4ce0402620d2D4C8C692C",
  "0x8C8ed236D367F7885478959aD5af37E5a1575afA",
];

const steerVaults = [
  "0x5d1F9ea2cDDEb3048d81Cb7aB7683C3c9F00D623",
  "0x1a80d8e5dA17D15A8140B0910c08634C83995D96",
  "0xD72B83dE434171d0Fa5336f1854125dFF0f84824",
  "0x79e14058406d8FdB91a59e29b3F127FA8Cdc2075",
  "0x1d4AAA36e2a6362C73a221f546813f1E48C41c11",
  "0xBfF450EfF556cb54F4b762bAfb9565266c35917D",
];

async function getSteerVaultTvl(api) {
  let tokens = await api.multiCall({
    abi: "address:asset",
    calls: steerVaults,
  });
  const [token0s, token1s, supplies, reserves, bals] = await Promise.all([
    api.multiCall({ abi: "address:token0", calls: tokens }),
    api.multiCall({ abi: "address:token1", calls: tokens }),
    api.multiCall({ abi: "uint256:totalSupply", calls: tokens }),
    api.multiCall({
      abi: "function getTotalAmounts() view returns (uint256 total0, uint256 total1)",
      calls: tokens,
    }),
    api.multiCall({
      abi: "uint256:totalAssets",
      calls: steerVaults,
    }),
  ]);

  bals.forEach((bal, i) => {
    const ratio = bal / supplies[i];
    const token0Bal = reserves[i][0] * ratio;
    const token1Bal = reserves[i][1] * ratio;
    api.addToken(token0s[i], token0Bal);
    api.addToken(token1s[i], token1Bal);
  });
}

async function getVaultTvl(api) {
  const assets = await Promise.all(
    vaults.map(async (vault) => {
      const assets = await api.call({
        abi: "function asset() view returns (address)",
        target: vault,
      });
      return assets;
    })
  );

  const balances = await Promise.all(
    vaults.map(async (vault) => {
      const assets = await api.call({
        abi: "function totalAssets() view returns (uint256)",
        target: vault,
      });
      return assets;
    })
  );
  api.addTokens(assets, balances);
}

async function tvl(api) {
  await getSteerVaultTvl(api);
  await getVaultTvl(api);
  return sumTokens2({ api, resolveLP: true });
}

module.exports = {
  methodology:
    "Calculates the total value of all assets locked in the vaults on Beratrax",
  berachain: {
    tvl,
  },
};
