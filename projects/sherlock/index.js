const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const usdcabi = require('./usdcabi.json');
const sherlockV2abi = require('./sherlockV2abi.json');
const BigNumber = require("bignumber.js");

const USDC = ADDRESSES.ethereum.USDC;
const SherlockContract = '0xacbBe1d537BDa855797776F969612df7bBb98215';
const SherlockV2Contract = '0x0865a889183039689034dA55c1Fd12aF5083eabF';

async function tvl(timestamp, block) {
    let balances = {};

    const SherlockTVL = await sdk.api.abi.call({
      target: USDC,
      abi: usdcabi['balanceOf'],
      params: SherlockContract,
      block: block
    });
    const SherlockV2TVL = await sdk.api.abi.call({
      target: SherlockV2Contract,
      abi: sherlockV2abi['totalTokenBalanceStakers'],
      block: block
    });

    const sherlockBalance = new BigNumber(SherlockTVL.output);
    const sherlockV2Balance = new BigNumber(SherlockV2TVL.output);

    balances[USDC] = sherlockV2Balance.plus(sherlockBalance).toString();

    return balances;
}

module.exports = {
  methodology: 'We count USDC that has been staked into the contracts (staking pool). Periodically USDC is swept into Aave, so we also count the aUSDC that is held (in a separate contract from the main contract).',
  start: '2021-09-28',            // 9/28/2020 @ 8:00pm (UTC)
  ethereum: { tvl }                           // tvl adapter
}
