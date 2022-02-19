const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const {
  transformPolygonAddress,
  transformFantomAddress,
  transformCeloAddress,
  transformAvaxAddress,
  fixAvaxBalances,
  transformHarmonyAddress,
  fixHarmonyBalances,
  transformBscAddress,
} = require("../helper/portedTokens");

const vaultsContractPolygon = "0xBF65023BcF48Ad0ab5537Ea39C9242de499386c9";
const ignoreAddresses_polygon = ["0x0B048D6e01a6b9002C291060bF2179938fd8264c"];

const vaultsContractFantom = "0x876F890135091381c23Be437fA1cec2251B7c117";
const vaultsContractCelo = "0xd54AA6fEeCc289DeceD6cd0fDC54f78079495E79";
const vaultsContractAvax = "0xc9070B3EFE0aacC5AfB4B31C5DbDCA7C6B4bAAA9";
const vaultsContractCronos = "0x8fEc7A778Cba11a98f783Ebe9826bEc3b5E67F95";
const vaultsContractHarmony = "0x8fec7a778cba11a98f783ebe9826bec3b5e67f95";
const vaultsContractBsc = "0xD3aB90CE1eEcf9ab3cBAE16A00acfbace30EbD75";

const calcTvl = async (
  balances,
  chain,
  block,
  masterchef,
  transformAddress,
  ignoreAddresses
) => {
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterchef,
      chain,
      block,
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLength; index++) {
    const strat = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: masterchef,
        params: index,
        chain,
        block,
      })
    ).output.strategy;

    const stakeToken = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: masterchef,
        params: index,
        chain,
        block,
      })
    ).output.stakeToken;

    const strat_bal = (
      await sdk.api.abi.call({
        abi: abi.totalStakeTokens,
        target: strat,
        chain,
        block,
      })
    ).output;

    const symbol = (
      await sdk.api.abi.call({
        abi: abi.symbol,
        target: stakeToken,
        chain,
        block,
      })
    ).output;

    if (
      ignoreAddresses.some(
        (addr) => addr.toLowerCase() === stakeToken.toLowerCase()
      )
    ) {
    } else if (symbol.includes("LP") || symbol.includes("UNI-V2")) {
      lpPositions.push({
        token: stakeToken,
        balance: strat_bal,
      });
    } else {
      sdk.util.sumSingleBalance(balances, `${chain}:${stakeToken}`, strat_bal);
    }
  }

  await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAddress);
};

const polygonTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformPolygonAddress();

  await calcTvl(
    balances,
    "polygon",
    chainBlocks["polygon"],
    vaultsContractPolygon,
    transformAddress,
    ignoreAddresses_polygon
  );

  return balances;
};

const fantomTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformFantomAddress();

  await calcTvl(
    balances,
    "fantom",
    chainBlocks["fantom"],
    vaultsContractFantom,
    transformAddress,
    []
  );

  return balances;
};

const celoTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformCeloAddress();

  await calcTvl(
    balances,
    "celo",
    chainBlocks["celo"],
    vaultsContractCelo,
    transformAddress,
    []
  );

  for (const representation of ["celo-dollar", "celo", "celo-euro"]) {
    if (balances[representation] !== undefined) {
      balances[representation] = Number(balances[representation]) / 1e18;
    }
  }

  return balances;
};

const avaxTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformAvaxAddress();

  await calcTvl(
    balances,
    "avax",
    chainBlocks["avax"],
    vaultsContractAvax,
    transformAddress,
    []
  );

  fixAvaxBalances(balances);

  return balances;
};

const cronosTvl = async (chainBlocks) => {
  const balances = {};

  await calcTvl(
    balances,
    "cronos",
    chainBlocks["cronos"],
    vaultsContractCronos,
    (addr) => `cronos:${addr}`,
    []
  );

  return balances;
};

const harmonyTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformHarmonyAddress();

  await calcTvl(
    balances,
    "harmony",
    chainBlocks["harmony"],
    vaultsContractHarmony,
    transformAddress,
    []
  );

  fixHarmonyBalances(balances);

  return balances;
};

const bscTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformBscAddress();

  await calcTvl(
    balances,
    "bsc",
    chainBlocks["bsc"],
    vaultsContractBsc,
    transformAddress,
    []
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: polygonTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  celo: {
    tvl: celoTvl,
  },
  avax: {
    tvl: avaxTvl,
  },
  cronos: {
    tvl: cronosTvl,
  },
  harmony: {
    tvl: harmonyTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  methodology: "We count liquidity on all the Vaults through YieldWolf Contracts",
};
