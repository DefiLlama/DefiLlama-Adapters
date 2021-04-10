const sdk = require('@defillama/sdk');

const abi_v1 = require('./abi-massetv1.json');
const abi_v2 = require('./abi-massetv2.json');

const mUSD_data = {
  version: 1,
  addr: '0x66126B4aA2a1C07536Ef8E5e8bD4EfDA1FdEA96D',
  start: 0
};
const mBTC_data = {
  version: 2,
  addr: '0x945Facb997494CC2570096c74b5F66A3507330a1',
  start: 11840521
}
const hbtc = {
  version: 2,
  addr: '0x48c59199Da51B7E30Ea200a74Ea07974e62C4bA7',
  start: 11840521
}
const tbtc = {
  version: 2,
  addr: '0xb61A6F928B3f069A68469DDb670F20eEeB4921e0',
  start: 11840521
}
const busd = {
  version: 2,
  addr: '0xfE842e95f8911dcc21c943a1dAA4bd641a1381c6',
  start: 11840521
}
const gusd = {
  version: 2,
  addr: '0x4fB30C5A3aC8e85bC32785518633303C4590752d',
  start: 11840521
}
const mAssets = [mUSD_data, mBTC_data, hbtc, tbtc, busd, gusd];
const ownAssetAddresses = ['0xe2f2a5C287993345a840Db3B0845fbC70f5935a5', '0x945Facb997494CC2570096c74b5F66A3507330a1'].map(addr=>addr.toLowerCase())

async function getV1(mAsset, block) {
  const res = await sdk.api.abi.call({
    block,
    target: mAsset.addr,
    abi: abi_v1['getBassets'],
  });
  const bAssets = res.output[0];

  const lockedTokens = {};

  bAssets.forEach(b => {
    lockedTokens[b[0]] = b[5]
  });

  return lockedTokens;
}

async function getV2(mAsset, block) {
  const res = await sdk.api.abi.call({
    block,
    target: mAsset.addr,
    abi: abi_v2['getBassets'],
  });

  const bAssetPersonal = res.output[0];
  const bAssetData = res.output[1];

  const lockedTokens = {};

  bAssetPersonal.forEach((b, i) => {
    lockedTokens[b[0]] = bAssetData[i][1]
  });

  return lockedTokens;
}

async function tvl(timestamp, block) {
  const tokens = await Promise.all(mAssets.filter(m => block > m.start).map(m =>
    m.version == 1 ? getV1(m, block) : getV2(m, block)
  ))

  const balances = {}
  tokens.forEach(token=>Object.entries(token).forEach(underlying=>{
    if(!ownAssetAddresses.includes(underlying[0].toLowerCase())){ // No double dipping
      sdk.util.sumSingleBalance(balances, underlying[0], underlying[1])
    }
  }))

  return balances;
}

module.exports = {
  name: 'mStable',
  token: 'MTA',
  category: 'assets',
  start: 1590624000, // May-28-2020 00:00:00
  tvl
}
