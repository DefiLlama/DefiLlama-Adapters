const sdk = require("@defillama/sdk");
const { getLogs } = require('../helper/cache/getLogs')

const wxHOPR_TOKEN_SMART_CONTRACT_ADDRESS = '0xD4fdec44DB9D44B8f2b6d529620f9C0C7066A2c1';
const xHOPR_TOKEN_SMART_CONTRACT_ADDRESS  = '0xD057604A14982FE8D88c5fC25Aac3267eA142a08';
const SAFE_FACTORY = '0x098B275485c406573D042848D66eb9d63fca311C';
const HOPR_CHANNELS = '0x693Bac5ce61c720dDC68533991Ceb41199D8F8ae';
const TOKEN_DECIMALS = 18;
const CHAIN = 'xdai';

function tvl() {
  return async (timestamp, ethBlock, chainBlocks, { api }) => {

    const logs = await getLogs({
      api,
      target: SAFE_FACTORY,
      topic: 'NewHoprNodeStakeSafe(address)',
      fromBlock: 29706820,
      eventAbi: 'event NewHoprNodeStakeSafe(address instance)'
    });

    const safes = logs.map(log => log.args[0]);
    const balanceOfSafes = await balanceOfs(wxHOPR_TOKEN_SMART_CONTRACT_ADDRESS, CHAIN, safes);
    const balanceOfChannels = BigInt((
      await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: wxHOPR_TOKEN_SMART_CONTRACT_ADDRESS,
        params: HOPR_CHANNELS,
        chain: CHAIN
      })
    ).output);

    const BigIntTvl = balanceOfSafes + balanceOfChannels;

    const tvl = { [`xdai:${xHOPR_TOKEN_SMART_CONTRACT_ADDRESS}`]: BigIntTvl.toString() }
    
    return tvl
  }
}

async function balanceOfs(token, chain, accounts) {
  const results = (
    (await sdk.api.abi.multiCall({
      calls: accounts.map((account) => ({
        target: token,
        params: account,
      })),
      abi: "erc20:balanceOf",
      chain,
      requery: true,
    }))
  ).output;

  let sum = BigInt(0);
  results.forEach((safe) => {
    if (safe.success) {
      sum+= BigInt(safe.output);
    }
  })

  return sum;
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  xdai: {
    tvl: tvl('xdai'),
  },
  methodology: 'HOPR TVL consists total amount of wxHOPR (wrapped xHOPR) that all users have in their HOPR Safes staked to receive a share of the revenue, and also the total amount of wxHOPR locked in the channels contract.',
};