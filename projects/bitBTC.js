const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens2 } = require('./helper/unwrapLPs');

const WBTC = ADDRESSES.optimism.WBTC;
const bitANT = ADDRESSES.optimism.BitANT;
const bitBTC = "0xc98b98d17435aa00830c87ea02474c5007e1f272";

const tvlContracts = [
  {
    address: '0x03bBa86E68c7DD733703cbCD44072082aF702d85', // farmV2
    token: WBTC
  }, {
    address: '0xEcbaFFaa5c4e94219f4C166DaC9D4A1520CAd827', // farmV3
    token: WBTC
  }
];

const stakingContracts = [
  {
    address: '0x03bBa86E68c7DD733703cbCD44072082aF702d85', // farmV2
    token: bitANT
  }, {
    address: '0xEcbaFFaa5c4e94219f4C166DaC9D4A1520CAd827', // farmV3
    token: bitANT
  }, {
    address: '0x03bBa86E68c7DD733703cbCD44072082aF702d85', // farmV2
    token: bitBTC
  }, {
    address: '0xEcbaFFaa5c4e94219f4C166DaC9D4A1520CAd827', // farmV3
    token: bitBTC
  }
];

async function findBalances(contracts, api) {
  const tokensAndOwners = contracts.map(i => ([i.token, i.address]));
  return sumTokens2({ api, tokensAndOwners });
}

async function tvl(api) {
  return await findBalances(tvlContracts, api);
}

async function staking(api) {
  return await findBalances(stakingContracts, api);
}

module.exports = {
  optimism: {
    tvl,
    staking
  }
};