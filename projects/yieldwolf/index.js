const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const {
  getChainTransform,
  getFixBalances,
} = require("../helper/portedTokens");

const vaultsContractPolygon = "0xBF65023BcF48Ad0ab5537Ea39C9242de499386c9";
const ignoreAddresses_polygon = ["0x0B048D6e01a6b9002C291060bF2179938fd8264c"];

const vaultsContractFantom = "0x876F890135091381c23Be437fA1cec2251B7c117";
const vaultsContractCelo = "0xd54AA6fEeCc289DeceD6cd0fDC54f78079495E79";
const vaultsContractAvax = "0xc9070B3EFE0aacC5AfB4B31C5DbDCA7C6B4bAAA9";
const vaultsContractCronos = "0x8fEc7A778Cba11a98f783Ebe9826bEc3b5E67F95";
const vaultsContractHarmony = "0x8fec7a778cba11a98f783ebe9826bec3b5e67f95";
const vaultsContractBsc = "0xD3aB90CE1eEcf9ab3cBAE16A00acfbace30EbD75";

const calcTvl = async (chain, block, masterchef, ignoreAddresses = []) => {
  const balances = {}
  const transformAddress = await getChainTransform(chain)
  const poolLength = (
    await sdk.api.abi.call({ abi: abi.poolLength, target: masterchef, chain, block, })
  ).output;
  const calls = []
  for (let index = 0; index < poolLength; index++)
    calls.push({ params: index })

  const { output: res } = await sdk.api.abi.multiCall({
    target: masterchef,
    abi: abi.poolInfo,
    calls: calls,
    chain, block,
  });

  const stratCalls = res.map(i => ({ target: i.output.strategy }))

  const { output: stratResponse } = await sdk.api.abi.multiCall({
    abi: abi.totalStakeTokens,
    calls: stratCalls,
    chain, block,
  });

  res.forEach(({ output }, i) => {
    const token = output.stakeToken
    if (ignoreAddresses.some((addr) => addr.toLowerCase() === token.toLowerCase())) return;
    sdk.util.sumSingleBalance(balances, transformAddress(token), stratResponse[i].output)
  })

  await unwrapLPsAuto({ balances, block, chain, transformAddress })
  const fixBalances = await getFixBalances(chain)
  fixBalances(balances)
  return balances
};

const polygonTvl = async (ts, _, chainBlocks) => {
  return calcTvl("polygon", chainBlocks["polygon"], vaultsContractPolygon, ignoreAddresses_polygon);
};

const fantomTvl = async (ts, _, chainBlocks) => {
  return calcTvl("fantom", chainBlocks["fantom"], vaultsContractFantom,);
};

const celoTvl = async (ts, _, chainBlocks) => {
  return calcTvl("celo", chainBlocks["celo"], vaultsContractCelo,);
};

const avaxTvl = async (ts, _, chainBlocks) => {
  return calcTvl("avax", chainBlocks["avax"], vaultsContractAvax,);
};

const cronosTvl = async (ts, _, chainBlocks) => {
  return calcTvl("cronos", chainBlocks["cronos"], vaultsContractCronos,);
};

const harmonyTvl = async (ts, _, chainBlocks) => {
  return calcTvl("harmony", chainBlocks["harmony"], vaultsContractHarmony,);
};

const bscTvl = async (ts, _, chainBlocks) => {
  return calcTvl("bsc", chainBlocks["bsc"], vaultsContractBsc,);
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
