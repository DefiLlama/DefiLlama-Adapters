/**
 * DefiLlama TVL Adapter for Syn DAO
 * Chain: Arc Mainnet (Chain ID 5042)
 * Website: https://syndaopro.xyz
 */

const { sumTokensExport } = require('../helper/unwrapLPs');

// Syn DAO deployed contracts on Arc Mainnet
const TREASURY_ADDRESS = '0x8205e9782Fe54fD2aaD895b436B695db169F3d7B';
const CROWDFUND_ADDRESS = '0x99955b487aE5519a2b1Ff677f9bed3A6145b750d';

// Canonical tokens on Arc Mainnet
const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'; // Circle USDC
const EURC_ADDRESS = '0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1'; // Circle EURC
const CIRBTC_ADDRESS = '0x171A4217b86A807A64eB94757Db6849fb4bDbAA0'; // Circle Wrapped Bitcoin (cirBTC)

const TRACKED_TOKENS = [USDC_ADDRESS, EURC_ADDRESS, CIRBTC_ADDRESS];

module.exports = {
  methodology:
    'TVL counts the USDC, EURC, and cirBTC balances deposited in the Syn DAO Crowdfund and Treasury contracts on Arc Network.',
  start: '2026-10-01',
  arc: {
    tvl: sumTokensExport({
      owners: [TREASURY_ADDRESS, CROWDFUND_ADDRESS],
      tokens: TRACKED_TOKENS,
    }),
  },
};
