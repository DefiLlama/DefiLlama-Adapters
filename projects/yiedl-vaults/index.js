const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { opsManagerAbi, opsHelperAbi } = require("../yiedl-vaults/abi");
const { VAULTS, HELPER, SUSD } = require("../yiedl-vaults/constants");
const { get } = require("../helper/http");

const CHAIN = "optimism";
const BLOCK_URL = `https://coins.llama.fi/block/${CHAIN}`;
const PORTFOLIO_ROTATION_TIMEOUT = 8 * 60 * 60;

async function getClosestBlockBefore(timestamp) {
  const data = await get(`${BLOCK_URL}/${timestamp}`);
  if (data['timestamp'] > timestamp) {
    return data['height'] - 1;
  }
  return data['height'];
}

async function getEligibleBlock(timestamp, vault) {
  const portfolioRotationStart = (await sdk.api.abi.call({
    abi: opsManagerAbi.portfolioRotationStartTimestamp,
    target: vault.OpsManager,
    chain: CHAIN,
  })).output;

  const portfolioRotationEnd = (await sdk.api.abi.call({
    abi: opsManagerAbi.portfolioRotationEndTimestamp,
    target: vault.OpsManager,
    chain: CHAIN,
  })).output;

  const portfolioRotationActive =
    (portfolioRotationStart > portfolioRotationEnd) &&
    (timestamp <= (portfolioRotationStart + PORTFOLIO_ROTATION_TIMEOUT));

  if (portfolioRotationActive) {
    return await getClosestBlockBefore(portfolioRotationStart);
  }

  const phase = (await sdk.api.abi.call({
    abi: opsManagerAbi.operationsCache,
    target: vault.OpsManager,
    chain: CHAIN,
  })).output[0];

  if (phase > 0) {
    const phaseStart = (await sdk.api.abi.call({
      abi: opsManagerAbi.processStartTimestamp,
      target: vault.OpsManager,
      chain: CHAIN,
    })).output;

    return await getClosestBlockBefore(phaseStart);
  }

  return undefined;
}

async function tvlPerVault(timestamp, block, vault) {
  const eligibleBlock = await getEligibleBlock(timestamp, vault);
  return await _computeTvl(vault, eligibleBlock);
}

async function _computeTvl(vault, eligibleBlock) {
  const [assets, values, sizes, aeps, prices, flatUsd, totalSupply] =
    (await sdk.api.abi.call({
      abi: opsHelperAbi.getAssetValuesForPortfolio,
      params: [vault.OpsManager, 0, 0],
      target: HELPER,
      block: eligibleBlock,
      chain: CHAIN,
    })).output;

  let sum = values.reduce((accumulator, currentValue) => {
    return (new BigNumber(accumulator)).plus(new BigNumber(currentValue));
    }, new BigNumber(0));
  sum = sum.plus(new BigNumber(flatUsd));
  return sum;
}

async function tvl(api) {
  const vaultTypes = Object.keys(VAULTS);
  for (const vaultType of vaultTypes) {
    const amount = await tvlPerVault(api.timestamp, api.block, VAULTS[vaultType]);
    api.add(SUSD, amount.toNumber());
  }
}

module.exports = {
    optimism: {
    tvl,
  },
  start: '2023-12-20', // 2023-12-20 12:00:00 UTC
  methodology: 'Calculates the total value of positions held by the YIEDL Vaults in Synthetix Perpetuals.'
};
