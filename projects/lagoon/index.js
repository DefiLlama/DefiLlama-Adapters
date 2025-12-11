const { getLogs } = require("../helper/cache/getLogs");

const config = {
  arbitrum: {
    vaults:  [
        "0x99CD0b8b32B15922f0754Fddc21323b5278c5261", // Yield Algo Trading
    ],
    optinProxyFactory: {
      address: "0x9De724B0efEe0FbA07FE21a16B9Bf9bBb5204Fb4",
      fromBlock: 358686643 
    },
    beaconFactory: {
      address: "0x58a7729125acA9e5E9C687018E66bfDd5b2D4490",
      fromBlock: 324144504
    },
  },
  avax: {
    optinProxyFactory:{
      address: "0xC094C224ce0406BC338E00837B96aD2e265F7287",
      fromBlock:  65620725
    },
    beaconFactory: {
      address: "0x5E231C6D030a5c0f51Fa7D0F891d3f50A928C685",
      fromBlock: 62519141
    },
  },
  base: {
    vaults: [
        "0xFCE2064B4221C54651B21c868064a23695E78f09", // 722Capital-ETH
        "0x8092cA384D44260ea4feaf7457B629B8DC6f88F0", // DeTrade Core USDC
        "0xB09F761Cb13baCa8eC087Ac476647361b6314F98", // 722Capital-USDC
      ],
    optinProxyFactory:{
      address: "0x6FC0F2320483fa03FBFdF626DDbAE2CC4B112b51",
      fromBlock: 32988756
    },
    beaconFactory: {
      address: "0xC953Fd298FdfA8Ed0D38ee73772D3e21Bf19c61b",
      fromBlock: 29100401
    },
  },
  berachain: {
    vaults: [],
    optinProxyFactory:{
      address: "0x245d1C095a0fFa6f1Af0f7Df81818DeFc9Cfc69D",
      fromBlock: 7858746
    },
    beaconFactory: {
      address: "0x7CF8cF276450BD568187fDC0b0959D30eC599853",
      fromBlock: 4061769
    },
  },
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
    optinProxyFactory:{
      address: "0x8D6f5479B14348186faE9BC7E636e947c260f9B1",
      fromBlock: 22940919
    },
    beaconFactory: {
      address: "0x09C8803f7Dc251f9FaAE5f56E3B91f8A6d0b70ee",
      fromBlock: 22218451
    },
  },
  
  katana: {
    vaults: [],
    optinProxyFactory:{
      address: "0xC094C224ce0406BC338E00837B96aD2e265F7287",
      fromBlock: 6025911
    },
    beaconFactory: {
      address: "0x37F4B3f0102FDC1ff0C7eF644751052fb276dc6e",
      fromBlock: 4544281
    },
  },
  linea: {
    optinProxyFactory:{
      address: "0x8D6f5479B14348186faE9BC7E636e947c260f9B1",
      fromBlock: 23119208
    },
  },
  mantle:{
    optinProxyFactory:{
      address: "0xc094c224ce0406bc338e00837b96ad2e265f7287",
      fromBlock: 82320704
    },
    beaconFactory: {
      address: "0x57D969B556C6AebB3Ac8f54c98CF3a3f921d5659",
      fromBlock: 79901742,
    },
  },
  optimism: {
    optinProxyFactory:{
      address: "0xA8E0684887b9475f8942DF6a89bEBa5B25219632",
      fromBlock: 141662524
    },
  },
  plasma: {
    optinProxyFactory:{
      address: "0xF838E8Bd649fc6fBC48D44E9D87273c0519C45c9",
      fromBlock: 2236159
    },
  },
  polygon: {
    optinProxyFactory:{
      address: "0x0C0E287f6e4de685f4b44A5282A3ad4A29D05a91",
      fromBlock: 76939871
    },
  },
  sonic: {
    optinProxyFactory:{
      address: "0x6FC0F2320483fa03FBFdF626DDbAE2CC4B112b51",
      fromBlock: 38968917
    },
    beaconFactory: {
      address: "0x8846189A4E46997Dd30Fd9e8bE48C1fA1B846920",
      fromBlock: 21645993,
    }
  },
  tac: {
    optinProxyFactory:{
      address: "0x66Ab87A9282dF99E38C148114F815a9C073ECA8D",
      fromBlock: 2334460
    },
    beaconFactory: {
      address: "0x3e39E287B4c94aC18831A63E5a6183Aa42cd85c3",
      fromBlock: 1817048,
    },
  },
  monad: {
    optinProxyFactory:{
      address: "0xcCdC4d06cA12A29C47D5d105fED59a6D07E9cf70",
      fromBlock: 36249718
    },
  },
  
  unichain: {
    vaults: [],
    optinProxyFactory:{
      address: "0x6FC0F2320483fa03FBFdF626DDbAE2CC4B112b51",
      fromBlock: 22021431
    },
    beaconFactory: {
      address: "0xaba1A2e157Dae248f8630cA550bd826725Ff745c",
      fromBlock: 14576623
    },
  },
  wc: {
    optinProxyFactory:{
      address: "0xC094C224ce0406BC338E00837B96aD2e265F7287",
      fromBlock: 16717424
    },
    beaconFactory: {
      address: "0x600fA26581771F56221FC9847A834B3E5fd34AF7",
      fromBlock: 14294168
    },
  },
};

const vaultsBlacklist = [
  "0xDe7CFf032D453Ce6B0a796043E75d380Df258812", // vault tac 9S, used mostly by another vault: 9s flagship, on Eth mainnet
  "0xd6DaBAf70977a867Fa884844FC5DCb21DE81c498", // vault tac 9s. but on TAC chain
  "0xd730f24d993398d29dbaa537b6e1bd71a55df775", // test vault with fake totalAssets 
]

function keepVault(vault, vaultBlacklist) {
  return  vaultBlacklist.indexOf(vault) == -1;
}

Object.keys(config).forEach((chain) => {
  let {vaults, beaconFactory, optinProxyFactory} = config[chain];
  if (!vaults) vaults = [];
  module.exports[chain] = { 
    tvl: async (api) =>  {
      let beaconFactoryVaults = await getBeaconFactoryVaults({api, factory: beaconFactory?.address, fromBlock: beaconFactory?.fromBlock});
      let optinProxyFactoryVaults = await getOptinProxyFactoryVaults({api, factory: optinProxyFactory?.address, fromBlock: optinProxyFactory?.fromBlock});
      beaconFactoryVaults = beaconFactoryVaults.filter((v) => keepVault(v, vaultsBlacklist));
      optinProxyFactoryVaults = optinProxyFactoryVaults.filter((v) => keepVault(v, vaultsBlacklist));

      return await api.erc4626Sum2({
        calls: [...vaults, ...beaconFactoryVaults, ...optinProxyFactoryVaults],
      })
    }
}}
)



const BeaconProxyDeployed = "0xfa8e336138457120a1572efbe25f72698abd5cca1c9be0bce42ad406ff350a2b";
async function getBeaconFactoryVaults({api, factory, fromBlock})  {
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
const ProxyDeployed = "0x8b5fd0eb1f997b4ecac1f234109294d6ace2519fc7abeab9f315fef38e2eb1dc";
async function getOptinProxyFactoryVaults({api, factory, fromBlock})  {
  if (!api || !factory || !fromBlock) return [];
  const logs = await getLogs({
    api,
    target: factory,
    topic: ProxyDeployed,
    eventAbi: "event ProxyDeployed(address proxy, address deployer)",
    onlyArgs: true,
    fromBlock: fromBlock,
  });
  if (!logs) return [];
  return logs.map((vault) => vault.proxy);
}
