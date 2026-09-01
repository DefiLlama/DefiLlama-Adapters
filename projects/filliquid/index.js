const ADDRESSES = require('../helper/coreAssets.json')
const static_contract = "0xA25F892cF2731ba89b88750423Fc618De0959C43";
const fil_fig_stake_contract = "0xD44bfE4523f1B2703DDE9C7dBc010Ad39EF668f7";
const bsc_fig_stake_contract = "0xAF5dD88328d73916231a9e6a64bf0029354f5812";
const FIL_FIG_TOKEN = "0xc87FAb479B450993E8A7b498C631AdF81f3ca5B4";
const BSC_FIG_TOKEN = "0x2f3E415F56BA07b444bc68ED037377dE1a668D6B";

async function fil_tvl(api) {
  const filBalance = await api.call({
    abi: 'function getTVL() external view returns (uint)',
    target: static_contract,
  });
  api.add(ADDRESSES.null, filBalance);
}

async function getFigStake(api, contract, token) {
  const stakeList = await api.call({
    abi: 'function getTotalStakeList() view returns (uint256[])',
    target: contract,
  });
  const totalFIG = stakeList.reduce((a, b) => a + BigInt(b), 0n);
  api.add(token, totalFIG);
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts FIL locked in the statistical contract. Staking counts FIG staked on Filecoin and BSC.',
  filecoin: {
    tvl:fil_tvl,
    staking:(api) => getFigStake(api, fil_fig_stake_contract, FIL_FIG_TOKEN)
  },
  bsc: {
    staking:(api) => getFigStake(api, bsc_fig_stake_contract, BSC_FIG_TOKEN)
  }
};
