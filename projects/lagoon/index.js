const { getLogs } = require("../helper/cache/getLogs");

const config = {
  ethereum: {
    vaults:
      [
        "0x07ed467acD4ffd13023046968b0859781cb90D9B", // 9Summits Flagship ETH
        "0x03D1eC0D01b659b89a87eAbb56e4AF5Cb6e14BFc", // 9Summits Flagship USDC
        "0xB09F761Cb13baCa8eC087Ac476647361b6314F98", // 9Summits & Tulipa Capital cbBTC 
        "0x8092cA384D44260ea4feaf7457B629B8DC6f88F0", // Usual Invested USD0++ in stUSR
        "0x66dCB62da5430D800a1c807822C25be17138fDA8", // Unity Trust
        "0x71652D4898DE9A7DD35e472a5fe4577eC69d82f2", // Trinity Trust
        "0x7895a046b26cc07272b022a0c9bafc046e6f6396", // Noon tacUSN
        "0x8245FD9Ae99A482dFe76576dd4298f799c041D61", // Usual Invested USD0++ in USCC & USTB
        "0xaf87b90e8a3035905697e07bb813d2d59d2b0951", // Usual Invested USD0++ in TAC
      ],
    factory: {
      address: "0x09C8803f7Dc251f9FaAE5f56E3B91f8A6d0b70ee",
      fromBlock: 22218451
    },
  },
  base: {
    vaults: [
        "0xFCE2064B4221C54651B21c868064a23695E78f09", // 722Capital-ETH
        "0x8092cA384D44260ea4feaf7457B629B8DC6f88F0", // DeTrade Core USDC
        "0xB09F761Cb13baCa8eC087Ac476647361b6314F98", // 722Capital-USDC
      ],
    factory: {
      address: "0xC953Fd298FdfA8Ed0D38ee73772D3e21Bf19c61b",
      fromBlock: 29100401
    },
  },
  arbitrum: {
    vaults:  [
        "0x99CD0b8b32B15922f0754Fddc21323b5278c5261", // Yield Algo Trading
      ],
    factory: {
      address: "0x58a7729125acA9e5E9C687018E66bfDd5b2D4490",
      fromBlock: 324144504
    },
  },
  unichain: {
    vaults: [],
    factory: {
      address: "0xaba1A2e157Dae248f8630cA550bd826725Ff745c",
      fromBlock: 14576623
    },
  },

  berachain: {
    vaults: [],
    factory: {
      address: "0x7CF8cF276450BD568187fDC0b0959D30eC599853",
      fromBlock: 4061769
    },
  }
};

const vaultsBlacklist = [
  "0xDe7CFf032D453Ce6B0a796043E75d380Df258812", // vault tac 9S, used mostly by another vault: 9s flagship
]

function keepVault(vault, vaultBlacklist) {
  return  vaultBlacklist.indexOf(vault) == -1;
}



Object.keys(config).forEach((chain) => {
  const {vaults, factory} = config[chain];
  module.exports[chain] = { 
    tvl: async (api) =>  {
      let factoryVaults = await getFactoryVaults({api, factory: factory.address, fromBlock: factory.fromBlock});

      factoryVaults = factoryVaults.filter((v) => keepVault(v, vaultsBlacklist));

      return await api.erc4626Sum2({
        calls: [...vaults, ...factoryVaults],
      })
    }
}}
)

const BeaconProxyDeployed = "0xfa8e336138457120a1572efbe25f72698abd5cca1c9be0bce42ad406ff350a2b";


async function getFactoryVaults({api, factory, fromBlock})  {
  if (!api || !factory || !fromBlock) return [];
  const logs = await getLogs({
    api,
    target: factory,
    topic: BeaconProxyDeployed,
    eventAbi: "event BeaconProxyDeployed(address proxy, address deployer)",
    onlyArgs: true,
    fromBlock: fromBlock,
  });
  if (!logs) return [];
  return logs.map((vault) => vault.proxy);
}
