const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { unwrapUniswapLPs, sumTokens2, } = require("../helper/unwrapLPs");
const {
  getChainTransform,
} = require("../helper/portedTokens");

// --- BSC Addresses ---
const masterChefContractBsc = "0xDAD01f1d99191a2eCb78FA9a007604cEB8993B2D";
const HERO = "0x9b26e16377ad29a6ccc01770bcfb56de3a36d8b2";

const stakingContractBsc = [
  // Staking + vesting
  "0x6626c38b1cc5693e6a415fD1790F31DCD38B551A",
  // Staking Pool 1
  "0xF306F74Cc0669f02f280282F8F043F0239c37B0E",
  // Staking Pool 2
  "0x2fed5c1d16dec8c29f28a241d59350cbec21ee18",
  // Staking Pool 3
  "0x4a1645deb84bcd2bdfd234b4be7750306638f566",
  // Staking Pool 4
  "0xe403baa1e35ac50f2b2cbe4124c85e9f2823f0d6",
  // Staking Pool 5
  "0xd00751ebe4c273dc42456a8ce88a79ad5e867d87",
  // Boardroom 1
  "0xAFDe7b2D6498F278C6E95059b15b6a41ba7eA1a8",
  // Boardroom 2
  "0xaa0863882b9387ff1114da8841204179B2C5dC60",
  masterChefContractBsc,
];

const excludePool2Bsc = [
  "0x35BC504e05fa91f17552A9c3a6A2E7E9651A0622",
  "0x4BcaA3bd33fF733a581dF027aAd1EBDbDDb55CC2",
  "0x2d9108475B4c0795727546caA8aa7b75D18779F9",
];

const pool2StratsBsc = [
  "0x9cC7B6Ec33a9c42CA301eBe47773B5221A8F2083",
  "0xCA162Ffc19Bc445F215Cc40C74398691DD723B14",
  "0x1e2FC439a4235ce680C33e82fD2488617e53c443",
];

// --- Polygon Addresses ---
const masterChefContractPolygon = "0x8e5860DF653A467D1cC5b6160Dd340E8D475724E";
const HONOR = "0xb82a20b4522680951f11c94c54b8800c1c237693";

const stakingContractPolygon = [
  // Staking + vesting
  "0x047e7D6E8f4b6dEBa0537A7c7e852C4272981075",
  // Staking Pool 1
  "0x253f5089165579b86ddcae96143f871c1ec79031",
  // Staking Pool 2
  "0xfc4bf0c319d62844d4aff048439e678d76471c28",
  // Staking Pool 3
  "0xd06c448ab1570143054703a2cd317681c3c31ae8",
  // Staking Pool 4
  "0x102a30579e56eca4a2ef1b27dca141786bab3a5c",
  // Staking Pool 5
  "0xe9b8f2c454125d2bbc5a93e297f5a846ed921ae6",
  // Staking Pool 6
  "0x4ef76bbe7f942c69e8e7961339ee70654efc97c7",
  // Staking Pool 7
  "0x78f4a1e514af96d72a25a40ae4ebf80bb25bf300",
  // Staking Pool 8
  "0x600ef4e67a09188868603db0f2f12cfc606d8512",
  // Staking Pool 9
  "0x5c6e0756615e4a951f8fe4b4b30cbf2ea6c50aeb",
  // Staking Pool 10
  "0x2645a5865b20be653deceb8729fdcf8930b3ffac",
  // Staking Pool 11
  "0x20058fa67761ee0929b63e0adfd6793f6fafb2e8",
  // Staking Pool 12
  "0xafb3dc6934cf9474c1d5b85058001710b8e8dcfa",
  // Boardroom 1
  "0xDCfc3b59b74567083A76308b6D84Aef483148689",
  // Boardroom 2
  "0xf9f8E6C33Cc5BD633D6E5494c52BA6D8f9aB6452",
  // Boardroom 3
  "0x376D053876fDb5601cb87a342eE200e86704da62",
  masterChefContractPolygon,
];

const excludePool2Polygon = [
  "0x46489f825f11d7473D20279699b108aCAA246e73",
  "0x4Bd5dF4300b7c5309cB1A0143e4A6d0184B878e1",
];

const pool2StratsPolygon = [
  "0xC0148789554b38052a5c53115662B89BA9C40508",
  "0x545Fbc2b724b3A1F6Ca0925C1CB6E9c1f41bA891",
];

// --- OKEX Addresses ---
const masterChefContractOkex = "0xDb457E7fA88C9818f6134afD673941fCE777F92F";
const GLORY = "0xC3BdFEe6186849D5509601045af4Af567A001C94";
const stakingContractOkex = [
  // Staking + Vesting
  "0x76eB6494158eE62f99112b6316BA4cBAA8eF6ad4",
  // Boardroom 1
  "0x659b4414Df05F2c53264887E1a06D202EB1B04DF",
  // Boardroom 2
  "0xa9ae07c4f1e953912b15bac72e52b9c548e7dc47",
  // Pool Staking 1
  "0x8c37cd30d64cc9360a9beae7c896e805cac3ef54",
  // Pool Staking 2
  "0x94af3e9d4d82275a833dd367420d34ec3b4cc07b",
  masterChefContractOkex,
];

const excludePool2Okex = [
  "0x04C3aF284BEd636dE5400ddB24d7698dB457CE34",
  "0x5f6D4ADDC1D00e8e8565c07425C12c6E2DCbACe3",
];

const pool2StratsOkex = [
  "0xecEC29CC2bBD46AeBD7f84d18d3A360cdCb58170",
  "0xfa065195657A07f9c9F0A0a5e16DcD0Dff4AF11a",
];

const calcTvl = async (balances, chain, block, masterchef, transformAddress, excludePool2) => {
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterchef,
      chain,
      block,
    })
  ).output;

  const toa = [];
  const calls = [];

  for (let index = 0; index < poolLength; index++) calls.push({ params: index })

  const { output: data } = await sdk.api.abi.multiCall({
    target: masterchef,
    abi: abi.poolInfo,
    calls,
    chain, block,
  })

  data.forEach(i => toa.push([i.output.want, i.output.strat]))

  return sumTokens2({ balances, chain, block, tokensAndOwners: toa, resolveLP: true, blacklistedTokens: excludePool2 })
};

const bscTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await getChainTransform('bsc');

  await calcTvl(
    balances,
    "bsc",
    chainBlocks["bsc"],
    masterChefContractBsc,
    transformAddress,
    excludePool2Bsc
  );

  return balances;
};

const polygonTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await getChainTransform('polygon');

  await calcTvl(
    balances,
    "polygon",
    chainBlocks["polygon"],
    masterChefContractPolygon,
    transformAddress,
    excludePool2Polygon
  );

  return balances;
};

const okexTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await getChainTransform('okexchain');

  await calcTvl(
    balances,
    "okexchain",
    chainBlocks["okexchain"],
    masterChefContractOkex,
    transformAddress,
    excludePool2Okex
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bscTvl,
    staking: stakings(stakingContractBsc, HERO),
    pool2: pool2s(pool2StratsBsc, excludePool2Bsc),
  },
  polygon: {
    tvl: polygonTvl,
    staking: stakings(stakingContractPolygon, HONOR),
    pool2: pool2s(pool2StratsPolygon, excludePool2Polygon),
  },
  okexchain: {
    tvl: okexTvl,
    staking: stakings(stakingContractOkex, GLORY),
    pool2: pool2s(pool2StratsOkex, excludePool2Okex),
  },
  methodology:
    "We count liquidity on the Farms through MasterChef contracts",
};
