const { call } = require('../helper/chain/ton');
const ADDRESSES = require("../helper/coreAssets.json");
const { BigNumber } = require('bignumber.js');
// KTON's pools: KTON, and pKTON, its premium pool (jetton
// EQCtD-q8vItSYffdO3p23-gcnFpPIpcGx9tE1ImQ3f3thV4l, metadata served from app.kton.io).
const KTON_POOL_CONTRACT_ADDRESS = "EQA9HwEZD_tONfVz6lJS0PVKR5viEiEGyj9AuQewGQVnXPg0";
const PKTON_POOL_CONTRACT_ADDRESS = "EQDsW2P6nuP1zopKoNiCYj2xhqDan0cBuULQ8MH4o7dBt_7a";
async function getKtonData(pool) {
  const stacks = await call({
    target: pool,
    abi: 'get_pool_full_data',
    params: [],
    rawStack: true,
  });
  let newContractVersion = stacks.length === 34;
  const formattedStack = stacks.map((i, idx) => {
    if (i[0] === 'num') {
      if (`${i[1]}`.startsWith('-')) {
        return -BigInt(i[1].slice(1));
      }
      return BigInt(i[1]);
    }
    return i;
  });

  const objMapWithNewVersion = ['state', 'halted', 'totalBalance', 'interestRate', 'optimisticDepositWithdrawals', 'depositsOpen', 'instantWithdrawalFee', 'savedValidatorSetHash', 'previousRound', 'currentRound', 'minLoan', 'maxLoan', 'governanceFee', 'accruedGovernanceFee', 'disbalanceTolerance', 'creditStartPriorElectionsEnd', 'poolJettonMinter', 'poolJettonSupply', 'depositPayout', 'requestedForDeposit', 'withdrawalPayout', 'requestedForWithdrawal', 'sudoer', 'sudoerSetAt', 'governor', 'governorUpdateAfter', 'interestManager', 'halter', 'approver', 'controllerCode', 'jettonWalletCode', 'payoutMinterCode', 'projectedTotalBalance', 'projectedPoolSupply'];

  const objMapWithOldVersion = ['state', 'halted', 'totalBalance', 'interestRate', 'optimisticDepositWithdrawals', 'depositsOpen', 'savedValidatorSetHash', 'previousRound', 'currentRound', 'minLoan', 'maxLoan', 'governanceFee', 'poolJettonMinter', 'poolJettonSupply', 'depositPayout', 'requestedForDeposit', 'withdrawalPayout', 'requestedForWithdrawal', 'sudoer', 'sudoerSetAt', 'governor', 'governorUpdateAfter', 'interestManager', 'halter', 'approver', 'controllerCode', 'jettonWalletCode', 'payoutMinterCode', 'projectedTotalBalance', 'projectedPoolSupply'];
  const usedObjMap = newContractVersion ? objMapWithNewVersion : objMapWithOldVersion;
  const result = formattedStack.reduce((acc, curr, index) => {
    acc[usedObjMap[index]] = curr;
    return acc;
  }, {
    instantWithdrawalFee: 0n,
    accruedGovernanceFee: 0n,
    disbalanceTolerance: 30,
    creditStartPriorElectionsEnd: 0n,
    poolJettonMinter: '',
    poolJettonSupply: 0n,
  });

  const { totalBalance, poolJettonSupply, projectedPoolSupply, projectedTotalBalance } = result;
  const tvl = new BigNumber(totalBalance).toNumber();
  return {
    tvl
  };

}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the TON staked in the KTON and pKTON pools: each pool\'s total_balance from get_pool_full_data',
  ton: {
    tvl: async (api) => {
      for (const pool of [KTON_POOL_CONTRACT_ADDRESS, PKTON_POOL_CONTRACT_ADDRESS]) {
        const { tvl } = await getKtonData(pool);
        api.add(ADDRESSES.ton.TON, tvl);
      }
    },
  }
};