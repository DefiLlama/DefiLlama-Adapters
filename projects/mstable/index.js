/*==================================================
  Modules
==================================================*/

const sdk = require('@defillama/sdk');

/*==================================================
Settings
==================================================*/

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
const mAssets = [mUSD_data, mBTC_data];

/*==================================================
Main
==================================================*/

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

  const reduced = tokens.reduce((p, c) => ({ ...p, ...c }), {})

  return reduced;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: 'mStable',
  token: 'MTA',
  category: 'assets',
  start: 1590624000, // May-28-2020 00:00:00
  tvl
}
