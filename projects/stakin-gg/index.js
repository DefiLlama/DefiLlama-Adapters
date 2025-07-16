const WETH = '0x4200000000000000000000000000000000000006';
const CONTRACT = '0xEF5E916de82839A8131eaac866280492966cd37C';

async function tvl(api) {
  return api.sumTokens({ tokens: [WETH], owners: [CONTRACT] });
}

module.exports = {
  methodology: 'Counts WETH in the project’s main contract',
  start: 28896428,
  base: { tvl },
};