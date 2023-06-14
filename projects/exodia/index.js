const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');
const { transformFantomAddress } = require("../helper/portedTokens");
const { request, gql } = require("graphql-request");

const ExodStaking = "0x8b8d40f98a2f14e2dd972b3f2e2a2cc227d1e3be"
const exod = "0x3b57f3feaaf1e8254ec680275ee6e7727c7413c7"
const wsexod = "0xe992C5Abddb05d86095B18a158251834D616f0D1"
const gohm = "0x91fa20244fb509e8289ca630e5db3e9166233fdc"
const mai = "0xfb98b335551a418cd0737375a2ea0ded62ea213b"
const treasury = "0x6a654d988eebcd9ffb48ecd5af9bd79e090d8347"
const dai = ADDRESSES.fantom.DAI
const wftm = ADDRESSES.fantom.WFTM
const beetsvault = "0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce"
const poolid = "0xa216aa5d67ef95dde66246829c5103c7843d1aab000100000000000000000112"

function compareAddresses(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

const getPoolTokens = async (block) => {
  const poolTokens = (await sdk.api.abi.call({
    target: beetsvault,
    abi:  'function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)',
    params: poolid,
    block,
    chain: 'fantom',
  })).output

  const output = {}

  poolTokens.tokens.forEach((t, i) => {
    if (compareAddresses(mai, t)) {
      output[mai] = Number(poolTokens.balances[i])
    } else if (compareAddresses(wftm, t)) {
      output[wftm] = Number(poolTokens.balances[i])
    } else if (compareAddresses(gohm, t)) {
      output[gohm] = Number(poolTokens.balances[i])
    } else if (compareAddresses(exod, t)) {
      output[exod] = Number(poolTokens.balances[i])
    } else if (compareAddresses(wsexod, t)) {
      output[wsexod] = Number(poolTokens.balances[i])
    }
  })

  const tokens = [mai, dai, wftm, gohm]

  const balances = (await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: tokens.map(t => ({
      target: t,
      params: treasury,
    })),
    block,
    chain: 'fantom',          
  })).output

  balances.forEach((balance, idx) => {
    output[tokens[idx]] = output[tokens[idx]] ? output[tokens[idx]] + Number(balance.output) : Number(balance.output)
  })

  return output
}

const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformFantomAddress();

  await sumTokens(balances, [[exod, ExodStaking]], chainBlocks.fantom, 'fantom', transformAddress)

  return balances;
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transformAddress = await transformFantomAddress();

  const treasuryBalances = await getPoolTokens(chainBlocks.fantom)
  const tokens = [mai, dai, wftm, gohm, exod, wsexod]

  tokens.forEach(token => {
    sdk.util.sumSingleBalance(balances, transformAddress(token), treasuryBalances[token])
  })
  
  return balances;
}

module.exports = {
  fantom: {
    tvl,
    staking
  },
  methodology:
    "Counts tokens on the treasury for TVL and staked EXOD for staking",
};