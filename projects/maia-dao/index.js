const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getChainTransform } = require('../helper/portedTokens');
const { unwrapUniswapLPs, sumTokens2,  } = require('../helper/unwrapLPs');
const abis = require("./abis.json");

const HERMES = '0xb27bbeaaca2c00d6258c3118bab6b5b6975161c8';
const excludedTokens = ["0xa3e8e7eb4649ffc6f3cbe42b4c2ecf6625d3e802"];
const multisig = '0x77314eAA8D99C2Ad55f3ca6dF4300CFC50BdBC7F';
const tokens = [ADDRESSES.metis.WETH, ADDRESSES.metis.Metis, ADDRESSES.metis.m_USDC, ADDRESSES.metis.m_USDT, ADDRESSES.metis.DAI, '0xEfFEC28996aAff6D55B6D108a46446d45C3a2E71', '0x5ab390084812E145b619ECAA8671d39174a1a6d1',];

async function tvl(timestamp, _, { metis: block }) {
  const chain = 'metis'
  const balances = {};
  const transform = await getChainTransform(chain);

  const hermesBalance = (await sdk.api.abi.call({
    target: '0xa4C546c8F3ca15aa537D2ac3f62EE808d915B65b',
    abi: abis.locked,
    params: [2],
    block,
    chain: 'metis'
  })).output;

  balances[`metis:${HERMES}`] = BigInt(hermesBalance.amount - 8424424910000000000000000).toString()

  const noPairs = (await sdk.api.abi.call({
    target: '0x879828da3a678D349A3C8d6B3D9C78e9Ee31137F',
    abi: abis.length,
    block,
    chain: 'metis'
  })).output;

  const pairAddresses = (await sdk.api.abi.multiCall({
    target: '0x879828da3a678D349A3C8d6B3D9C78e9Ee31137F',
    calls: Array.from({ length: Number(noPairs) }, (_, k) => ({
      params: k,
    })),
    abi: abis.pools,
    block,
    chain: 'metis'
  })).output;

  let gauges = (await sdk.api.abi.multiCall({
    target: '0x879828da3a678D349A3C8d6B3D9C78e9Ee31137F',
    calls: pairAddresses.map(a => ({
      params: a.output
    })),
    abi: abis.gauges,
    block,
    chain: 'metis'
  })).output;

  let pairBalances = []

  for (let i = 0; i < Number(noPairs); i++) {
    pairBalances.push(
      await sdk.api.abi.call({
        target: gauges[i].output,
        abi: abis.balanceOf,
        params: [multisig],
        block: block,
        chain: "metis",
      })
    );
  }

  let lpPositions = [];
  for (let i = 0; i < pairBalances.length; i++) {
    if (
      pairAddresses[i].output &&
      excludedTokens.includes(pairAddresses[i].output.toLowerCase())
    ) {
      continue;
    }
    lpPositions.push({
      balance: pairBalances[i].output,
      token: pairAddresses[i].output
    });
  }

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    'metis',
    transform
  );
  return sumTokens2({ balances, owner: multisig, tokens, chain, block, resolveLP: 'true', })
}

module.exports = {
  metis: {
    tvl,
  }
}
