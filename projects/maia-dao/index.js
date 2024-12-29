const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2,  } = require('../helper/unwrapLPs');
const abis = require("./abis.json");

const HERMES = '0xb27bbeaaca2c00d6258c3118bab6b5b6975161c8';
const blacklistedTokens = ["0xa3e8e7eb4649ffc6f3cbe42b4c2ecf6625d3e802"];
const multisig = '0x77314eAA8D99C2Ad55f3ca6dF4300CFC50BdBC7F';
const tokens = [ADDRESSES.metis.WETH, ADDRESSES.metis.Metis, ADDRESSES.metis.m_USDC, ADDRESSES.metis.m_USDT, ADDRESSES.metis.DAI, '0xEfFEC28996aAff6D55B6D108a46446d45C3a2E71', '0x5ab390084812E145b619ECAA8671d39174a1a6d1',];

async function tvl(api) {

  const hermesBalance = await api.call({
    target: '0xa4C546c8F3ca15aa537D2ac3f62EE808d915B65b',
    abi: abis.locked,
    params: [2],
  })
  api.add(HERMES, hermesBalance.amount - 8424424910000000000000000)
  const pairs = await api.fetchList({  lengthAbi: abis.length, itemAbi: abis.pools, target: '0x879828da3a678D349A3C8d6B3D9C78e9Ee31137F' })

  const gauges = await api.multiCall({  abi: abis.gauges, calls: pairs, target: '0x879828da3a678D349A3C8d6B3D9C78e9Ee31137F'})
  const bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: gauges.map(gauge => ({ target: gauge, params: [multisig] }))})
  api.add(pairs, bals)
  return sumTokens2({ owner: multisig, tokens, api, resolveLP: 'true', blacklistedTokens, })
}

module.exports = {
  metis: {
    tvl: () => ({}),
  }
}
