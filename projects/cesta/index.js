const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

async function avax(timestamp, block) {
  const CestaVault = {
    DexAvax: "0xe4809ed214631017737a3d7fa3e78600ee96eb85",
    DexStable: "0xcfDafB1E6310c1844EcC30C60A01D6E0D37368C5",
    StableAvax: "0xfbE9613a6bd9d28ceF286b01357789b2b02E46f5",
    StableStable: "0xB103F669E87f67376FB9458A67226f2774a0B4FD",
  };
  let usd = ADDRESSES.ethereum.USDC;

  let [DexAvaxTVL, DexStableTVL, StableAvaxTVL, StableStableTVL] =
    await Promise.all([
      sdk.api.abi.call({
        block,
        target: CestaVault.DexAvax,
        abi: abi["getAllPoolInUSD"],
        chain: "avax",
      }),
      sdk.api.abi.call({
        block,
        target: CestaVault.DexStable, // contract address
        abi: abi["getAllPoolInUSD"], // erc20:methodName
        chain: "avax",
      }),
      sdk.api.abi.call({
        block,
        target: CestaVault.StableAvax, // contract address
        abi: abi["getAllPoolInUSD"], // erc20:methodName
        chain: "avax",
      }),
      sdk.api.abi.call({
        block,
        target: CestaVault.StableStable, // contract address
        abi: abi["getAllPoolInUSD"], // erc20:methodName
        chain: "avax",
      }),
    ]);

  DexAvaxTVL = parseInt(DexAvaxTVL.output) / 10 ** 12;
  DexStableTVL = parseInt(DexStableTVL.output) / 10 ** 12;
  StableAvaxTVL = parseInt(StableAvaxTVL.output) / 10 ** 12;
  StableStableTVL = parseInt(StableStableTVL.output) / 10 ** 12;

  const result = {
    "Dex-Avax Vault": DexAvaxTVL,
    "Dex-StableCoin Vault": DexStableTVL,
    "StableCoin-Avax Vault": StableAvaxTVL,
    "StableCoin Vault": StableStableTVL,
  };

  let balances = 0;
  for (const prop in result) {
    balances += result[prop];
  }
  let tk = usd;
  return { [tk]: balances };
}

module.exports = {
  avax: {
    tvl: avax,
  },
};
