const { get } = require('../helper/http')
const { staking } = require('../helper/staking')
const { toUSDTBalances } = require('../helper/balances');
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const apiUrl = 'https://api.neopin.io/napi/v1/info/neopin';
const methodology = `NEOPIN TVL provides the liquidity information of NEOPIN DEX (YieldFarm) and all assets (e.g. KLAY, TRX, NPT) staked in the staking pools. The data provided by NEOPIN TVL can be found in ${apiUrl}".`;

let data

async function getNeopinChains() {
  if (!data) data = get(apiUrl)
  const neopin = await data;
  const neopinChains = neopin.info.chain;
  return neopinChains;
}

function isTron(chain) {
  return chain.name === 'TRX';
}

async function fetchStakingFromTron() {
  const neopinChains = await getNeopinChains();
  const tronInfo = neopinChains.find(isTron);
  const { totalStakingTvl } = tronInfo.summary;
  return toUSDTBalances(totalStakingTvl);
}

module.exports = {
  misrepresentedTokens: true,
  methodology,
  klaytn: {
    tvl: sumTokensExport({
      chain: 'klaytn',
      owners: [
        '0xDa664b81C13b050F9b0435D0B712218Aa8BB1609',
        '0x0D3ACA076712DE598DF856cEcEF76daD38F0A75b',
      ],
      tokens: [nullAddress],
    }),
    staking: staking('0x306ee01a6ba3b4a8e993fa2c1adc7ea24462000c', '0xe06597d02a2c3aa7a9708de2cfa587b128bd3815', 'klaytn'),
  },
  tron: {
    tvl: fetchStakingFromTron,
  },
  timetravel: false,
}
