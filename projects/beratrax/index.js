const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");

const vaultFactories = [
  "0x33cB15BAeD0422E70Ed6f48c72106423F20e21D7",
  "0x2bA289beE93fa6cBae9eB64FB385f4cb199FF3EE",
  "0x5CaBB1155D0F0Ff975e30aCaaa11CDA12a6E5b7E",
];

const steerVaultAddresses = [
  "0x5d1F9ea2cDDEb3048d81Cb7aB7683C3c9F00D623",
  "0x1a80d8e5dA17D15A8140B0910c08634C83995D96",
  "0xD72B83dE434171d0Fa5336f1854125dFF0f84824",
  "0x79e14058406d8FdB91a59e29b3F127FA8Cdc2075",
  "0x1d4AAA36e2a6362C73a221f546813f1E48C41c11",
  "0xBfF450EfF556cb54F4b762bAfb9565266c35917D",
  "0x184FCE25EF41D72418DfD7953c2aD7574Fb8622A",
];

const burrBearVaultAddresses = [
  "0xFD2dE4473577fd5a786E0DFaA611Bbd334fAc8eA",
  "0x5490235e55E13CA58e821d873260f4979d650682",
  "0x066Eb1D1e33027bc36FaF3055cf12C8F892408fA",
];

const vaultAddresses = [
  "0x813C9ecE1Da3B529656DfCc5D42815f9cCf60B2c",
  "0x9bC238c1e0f31a5e016Ea484a698Ee7B4c3B219c",
  "0x45114A8fCFa77967FDb33E87f6284fc119128836",
  "0x76BAe24B0fc180B98A613E3AF19F1A6AE8E4d4F4",
  "0xe88e01F2e3eb8E867Bf38E873DCC229264696098",
  "0x7c04723AB200D55d1C826160340c089E7CaAFEea",
  "0x69D08aaCd061B4054036BE42D6807cf669de13bd",
  "0x2C368aD56E801ed8E8590DF84Cb537E98f566460",
  "0x388FF9498b8d967DE373b4a440a7A54A34Ec2743",
  "0xf279F04E3976cc9b32A4ce0402620d2D4C8C692C",
  "0x8C8ed236D367F7885478959aD5af37E5a1575afA",
  "0x738d85C6A53f9b924314f35ad5B73ac01f72dc65",
  "0x6D943AD0791F68F715f7A4317999Ce547baCc909",
  "0x491da46162A4A5F52cc30f6E63B352885bd7B419",
  "0xfA224a2184976956471e41d36A1eE465f197dB7B",
  "0xFD2dE4473577fd5a786E0DFaA611Bbd334fAc8eA",
  "0x29e953B1dC492973B6e55827Fd29674ACFa643C8",
  "0x4D6f6580a78EEaBEE50f3ECefD19E17a3f4dB302",
  "0x066Eb1D1e33027bc36FaF3055cf12C8F892408fA",
  "0x184FCE25EF41D72418DfD7953c2aD7574Fb8622A",
  "0x5490235e55E13CA58e821d873260f4979d650682",
  "0xF28D9A7C6060f8D85Cb8Cdd2cCfC5958A210E02B",
  "0x919Aa309eD3f13FA7B0DCF4B302F0563F0ED068B",
  "0x9f835f515835dcc51a703A3c7024cB301704cdE8",
  "0xe515356E67EE2c3A3C2f4beAA59bBDB97c1a766F",
  "0xD1872EB433811f0D45D4EF172c15b2460cB792B8",
  "0xfcfd364AE14B4803f41F3d7b1D1394097916926C",
  "0x74bCE2096803B3eEFDCE767b00383481CD408B4E",
  "0x96c0712b7B23eB33a7bdD2d737D6Eb87Ae007751",
  "0xB3fd1c9Df6C9FB81ca0419EEf0549c337D650509",
  "0x2dacFB135bB494BbF7B5273232628A535E147451",
  "0x0bd961356E316f0266Fb530844Fb5AEC99B4670f",
  "0xadFEBD4b9B2c0E04b0C506Fd99BE3380d277D58D",
  "0xfCAcd22Ce85DAd636d79234c533A49E442f38A60",
  "0x11663095b13c46E71f1a00A97101aFc1c0039e38",
  "0x22FF5a7CC33b6D219c0993C598F93ef251D21e93",
  "0x9Bb2Ffc17837Fecef317a65a4f5369157D5ee5B4",
  "0x4723BebA547c95A671709175fDc98795d2B2cf84",
  "0x716e9D67A7827a71e12F6b1BE66bbE03dC86762E",
  "0xb5B652d6D4Ae3f61507Fe05052b224596c42D6C0",
];

const stLBGTVaultAddress = "0x27555679E118ec6ECF5F37Dbf2Dc996695e00a1e";

async function getSteerVaultTvl(api, vaults) {
  let tokens = await api.multiCall({
    abi: "address:asset",
    calls: vaults,
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
      calls: vaults,
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

async function getBurrBearVaultTvl(api, vaults) {
  const assets = await Promise.all(
    vaults.map(async (vault) => {
      const assets = await api.call({
        abi: "function asset() view returns (address)",
        target: vault,
      });
      return assets;
    })
  );
  const poolIds = await Promise.all(
    assets.map(async (asset) => {
      const poolId = await api.call({
        abi: "function getPoolId() view returns (bytes32)",
        target: asset,
      });
      return poolId;
    })
  );
  const underlyingVaults = await Promise.all(
    assets.map(async (asset) => {
      const vaultAddress = await api.call({
        abi: "function getVault() view returns (address)",
        target: asset,
      });
      return vaultAddress;
    })
  );

  for (let i = 0; i < vaults.length; i++) {
    const [tokens, balances] = await api
      .call({
        abi: "function getPoolTokens(bytes32) view returns (address[], uint256[], uint256)",
        target: underlyingVaults[i],
        params: [poolIds[i]],
      })
      .then((res) => [res[0], res[1]]);

    const [vaultBptBal, totalSupply] = await Promise.all([
      api.call({
        abi: "function totalAssets() view returns (uint256)",
        target: vaults[i],
      }),
      api.call({ abi: "erc20:totalSupply", target: assets[i] }),
    ]);

    if (totalSupply == 0) continue;

    const ratio = vaultBptBal / totalSupply;
    tokens
      .filter((t) => t !== assets[i])
      .forEach((token, i) => {
        const underlying = balances[i] * ratio;
        api.addToken(token, underlying);
      });
  }
}

async function getVaultTvl(api, vaults) {
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

async function getStLBGTVaultTvl(api) {
  const stLbgt = await api.call({
    abi: "function asset() view returns (address)",
    target: stLBGTVaultAddress,
  });

  const lbgt = await api.call({
    abi: "function asset() view returns (address)",
    target: stLbgt,
  });

  const totalStLbgt = await api.call({
    abi: "function totalAssets() view returns (uint256)",
    target: stLBGTVaultAddress,
  });

  const totalLbgt = await api.call({
    abi: "function convertToAssets(uint256) view returns (uint256)",
    target: stLbgt,
    params: [totalStLbgt],
  });

  api.addToken(lbgt, totalLbgt);
}

async function tvl(api) {
  const _vaults = [];
  let vaults = [];
  let steerVaults = [];
  let burrBearVaults = [];

  // get all vaults from factories
  for (const factory of vaultFactories) {
    const logs = await getLogs2({
      api,
      factory,
      eventAbi: "event VaultCreated(address indexed vault)",
      fromBlock: 956824,
    });
    _vaults.push(...logs.map((log) => log.vault));
  }

  const vaultNames = await api.multiCall({
    abi: "string:name",
    calls: _vaults,
    permitFailure: true,
  });
  vaultNames.forEach((name, i) => {
    if (name && name.toLowerCase().includes("steer"))
      steerVaults.push(_vaults[i]);
    else vaults.push(_vaults[i]);
  });
 
  // getLogs2 is not picking up some VaultCreated events, so we add the hardcoded vaults
  const uniqueVaults = new Set([...vaults, ...vaultAddresses]);
  const uniqueSteerVaults = new Set([...steerVaults, ...steerVaultAddresses]);
  const uniqueBurrBearVaults = new Set([...burrBearVaultAddresses]);

  burrBearVaults = Array.from(uniqueBurrBearVaults);
  vaults = Array.from(uniqueVaults).filter(
    (vault) => !burrBearVaults.includes(vault) && vault !== stLBGTVaultAddress
  );
  steerVaults = Array.from(uniqueSteerVaults).filter(
    (vault) => !burrBearVaults.includes(vault)
  );

  await getSteerVaultTvl(api, steerVaults);
  await getVaultTvl(api, vaults);
  await getBurrBearVaultTvl(api, burrBearVaults);
  await getStLBGTVaultTvl(api);
  return sumTokens2({ api, resolveLP: true });
}

module.exports = {
  methodology:
    "Calculates the total value of all assets locked in the vaults on Beratrax",
  berachain: {
    tvl,
  },
};
