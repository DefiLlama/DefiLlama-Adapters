/* eslint-disable no-async-promise-executor */
const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const static_contract = "0xA25F892cF2731ba89b88750423Fc618De0959C43";
const fil_fig_stake_contract = "0xD44bfE4523f1B2703DDE9C7dBc010Ad39EF668f7";
const bsc_fig_stake_contract = "0xAF5dD88328d73916231a9e6a64bf0029354f5812";
const FIL_FIG_TOKEN = "0xc87FAb479B450993E8A7b498C631AdF81f3ca5B4";
const BSC_FIG_TOKEN = "0x2f3E415F56BA07b444bc68ED037377dE1a668D6B";
// function tvl(api) {
//   return api.call({
//     abi: 'function getTVL() external view returns (uint)',
//     target: static_contract,
//   }).then(balance => {
//     api.add(ADDRESSES.null, balance);
//   });
// }

async function fil_tvl(api) {
  const filBalance = await api.call({
    abi: 'function getTVL() external view returns (uint)',
    target: static_contract,
  });
  api.add(ADDRESSES.null, filBalance);

  const stakeList = await api.call({
    abi: 'function getTotalStakeList() view returns (uint256[])',
    target: fil_fig_stake_contract,
  });

  const totalFIG = stakeList.reduce((a, b) => a + BigInt(b), 0n);
  api.add(FIL_FIG_TOKEN, totalFIG);
}

async function tvl_bsc(api) {
  const stakeList = await api.call({
    abi: 'function getTotalStakeList() view returns (uint256[])',
    target: bsc_fig_stake_contract,
  });
  const totalFIG = stakeList.reduce((a, b) => a + BigInt(b), 0n);
  api.add(BSC_FIG_TOKEN, totalFIG);
}

module.exports = {
  timetravel: false,
  methodology: 'Get the total amount of pledge and account balance of fil in the statistical contract',
  filecoin: {
    tvl:fil_tvl
  },
  bsc: {
    tvl:tvl_bsc
  }
};
/* eslint-enable no-async-promise-executor */
