const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");

const vaultFactories = [
  "0x33cB15BAeD0422E70Ed6f48c72106423F20e21D7",
  "0x2bA289beE93fa6cBae9eB64FB385f4cb199FF3EE",
  "0x5CaBB1155D0F0Ff975e30aCaaa11CDA12a6E5b7E",
];

const steerVaults = [
  "0x5d1F9ea2cDDEb3048d81Cb7aB7683C3c9F00D623",
  "0x1a80d8e5dA17D15A8140B0910c08634C83995D96",
  "0xD72B83dE434171d0Fa5336f1854125dFF0f84824",
  "0x79e14058406d8FdB91a59e29b3F127FA8Cdc2075",
  "0x1d4AAA36e2a6362C73a221f546813f1E48C41c11",
  "0xBfF450EfF556cb54F4b762bAfb9565266c35917D",
  "0x184FCE25EF41D72418DfD7953c2aD7574Fb8622A",
];

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

async function tvl(api) {
  const _vaults = [];
  let vaults = []

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

  const vaultNames = await api.multiCall({ abi: 'string:name', calls: _vaults, permitFailure: true })
  vaultNames.forEach((name, i) => {
    if (name && name.toLowerCase().includes("steer"))
      steerVaults.push(_vaults[i])
    else
      vaults.push(_vaults[i])
  })

  await getSteerVaultTvl(api, steerVaults);
  await getVaultTvl(api, vaults);
  return sumTokens2({ api, resolveLP: true });
}

module.exports = {
  methodology:
    "Calculates the total value of all assets locked in the vaults on Beratrax",
  berachain: {
    tvl,
  },
};
