const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');

const apiUrl = 'https://api.neopin.io/napi/v1/info/neopin';
const methodology = `NEOPIN TVL provides the liquidity information of NEOPIN DEX (YieldFarm) and all assets (e.g. KLAY, TRX, NPT) staked in the staking pools. The data provided by NEOPIN TVL can be found in ${apiUrl}".`;

async function getNeopinChains() {
  const neopin = await get(apiUrl);
  const neopinChains = neopin.info.chain;
  return neopinChains;
}

function isKlaytn(chain) {
  return chain.name === 'KLAY';
}

function isTron(chain) {
  return chain.name === 'TRX';
}

async function fetchTVLFromKlaytn() {
  const neopinChains = await getNeopinChains();
  const klayInfo = neopinChains.find((element) => {
    return isKlaytn(element);
  });
  const { totalYieldTvl } = klayInfo.summary;
  let totalTVL = new BigNumber('0');
  return toUSDTBalances(totalTVL.plus(totalYieldTvl).toFixed(2));
}

async function fetchStakingFromKlaytn() {
  const neopinChains = await getNeopinChains();
  const klayInfo = neopinChains.find((element) => {
    return isKlaytn(element);
  });
  const { totalStakingTvl } = klayInfo.summary;
  let totalStaking = new BigNumber('0');
  return toUSDTBalances(totalStaking.plus(totalStakingTvl).toFixed(2));
}

async function fetchTVLFromTron() {
  const neopinChains = await getNeopinChains();
  const tronInfo = neopinChains.find((element) => {
    return isTron(element);
  });
  const { totalYieldTvl } = tronInfo.summary;
  let totalTVL = new BigNumber('0');
  return toUSDTBalances(totalTVL.plus(totalYieldTvl).toFixed(2));
}

async function fetchStakingFromTron() {
  const neopinChains = await getNeopinChains();
  const tronInfo = neopinChains.find((element) => {
    return isTron(element);
  });
  const { totalStakingTvl } = tronInfo.summary;
  let totalStaking = new BigNumber('0');
  return toUSDTBalances(totalStaking.plus(totalStakingTvl).toFixed(2));
}

module.exports = {
  methodology,
  klaytn: {
    tvl: fetchTVLFromKlaytn,
    staking: fetchStakingFromKlaytn
  },
  tron: {
    tvl: fetchTVLFromTron,
    staking: fetchStakingFromTron
  },
  misrepresentedTokens: false,
  timetravel: false,
}