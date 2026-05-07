const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const LANDSHARE_TOKEN_CONTRACT = '0xA73164DB271931CF952cBaEfF9E8F5817b42fA5C';
const LANDSHARE_STAKING_CONTRACT = '0x3f9458892fB114328Bc675E11e71ff10C847F93b';
const LANDSHARE_LP_TOKEN_CONTRACT = '0x13f80c53b837622e899e1ac0021ed3d1775caefa';
const API_CONSUMER = '0x61f8c9fE835e4CA722Db3A81a2746260b0D77735';
const USDT = ADDRESSES.bsc.USDT;
const LSRWA_USDT_LP = '0x89bad177367736C186F7b41a9fba7b23474A1b35';


async function tvl(api) {
      // RWA property value from on-chain API consumer
      const rwaValue = await api.call({
        abi: 'function getTotalValue() view returns (uint256)',
        target: API_CONSUMER,
      });
      if (Number(rwaValue) > 0) {
        api.addUSDValue(Number(rwaValue) / 1e18);
      }
    }


module.exports = {
  methodology: 'Counts LP Tokens (LAND-BNB and LSRWA-USDT), staked LAND, and LSRWA TVL',
  bsc: {
  staking: staking(LANDSHARE_STAKING_CONTRACT, LANDSHARE_TOKEN_CONTRACT),
  pool2: pool2s([LANDSHARE_STAKING_CONTRACT], [LANDSHARE_LP_TOKEN_CONTRACT, LSRWA_USDT_LP]),
  tvl,
  }
}; 