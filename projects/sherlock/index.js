const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const usdcabi = require('./usdcabi.json');


const AaveContract = '0xEECee260A402FE3c20e5B8301382005124bef121';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const aUSDC = '0xBcca60bB61934080951369a648Fb03DF4F96263C';
const SherlockContract = '0xacbBe1d537BDa855797776F969612df7bBb98215';

async function tvl(timestamp, block) {
    let balances = {};

    const AaveTVL = await sdk.api.abi.call({
      target: AaveContract,
      abi: abi['balanceOf'],
      block: block
    });
    const SherlockTVL = await sdk.api.abi.call({
      target: USDC,
      abi: usdcabi['balanceOf'],
      params: SherlockContract,
      block: block
    });

    balances[aUSDC] = AaveTVL.output;
    balances[USDC] = SherlockTVL.output;

    return balances;
}

module.exports = {
  methodology: 'We count USDC that has been staked into the contracts (staking pool). Periodically USDC is swept into Aave, so we also count the aUSDC that is held (in a separate contract from the main contract).',
  name: 'Sherlock',               // project name
  website: 'https://app.sherlock.xyz',
  token: 'SHER',
  category: 'insurance',          // Insurance?
  start: 1632861292,            // 9/28/2020 @ 8:00pm (UTC)
  tvl                           // tvl adapter
}
