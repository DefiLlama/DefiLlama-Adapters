const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// B-Lucky Protocol Contracts on BSC
const HOUSE_FUNDING_CONTRACT = '0xA7f03BeAF428801476b1eBB226A5AD434dCFBA50';
const LOTTERY_CONTRACT = '0xe18EAD45d0B0c04293Ad90Fa4E27C561e935AD5E';
const LOTTERY_CONTRACT_V2 = '0x98207bb96E5FAE18E930dE1c2AAa27a5A72263CB';
const STAKING_CONTRACT = '0xbB3BFfaCe9C9bf7FeD9ECBB93c0DCF4449e878fe';
const LUCKY_TOKEN = '0x67b47971426bb2180453b3993FF2ec319e704444';

// TVL calculation: BNB and WBNB deposited in House Funding and Lottery contracts
async function tvl(api) {
  // Get BNB and WBNB balance in House Funding and Lottery contracts
  return api.sumTokens({ 
    owners: [HOUSE_FUNDING_CONTRACT, LOTTERY_CONTRACT, LOTTERY_CONTRACT_V2], 
    tokens: [ADDRESSES.null, ADDRESSES.bsc.WBNB] 
  });
}

// Staking calculation: LUCKY tokens staked in Staking contract
async function staking(api) {
  // Get LUCKY tokens balance in Staking contract
  return sumTokens2({ api, owner: STAKING_CONTRACT, tokens: [LUCKY_TOKEN] });
}

module.exports = {
  methodology: 'B-Lucky is an on-chain lottery protocol on BSC. TVL consists of BNB and WBNB deposited in the House Funding and Lottery contracts which provide liquidity for lottery prizes. Staking tracks LUCKY tokens staked in the Staking contract where holders earn BNB rewards from protocol revenue.',
  bsc: {
    tvl,
    staking,
  }
};
