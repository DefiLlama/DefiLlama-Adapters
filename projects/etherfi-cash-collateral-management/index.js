const ADDRESSES = require('../helper/coreAssets.json');
const { getEnv } = require('../helper/env');
const { sliceIntoChunks, sleep } = require('../helper/utils');

const EtherFiCashFactory = '0xF4e147Db314947fC1275a8CbB6Cde48c510cd8CF';
const CashBorrowerHelperContract = '0xF0df37503714f08d0fCA5B434F1FFA2b8b1AF34B';

const abi = {
  getTotalCollateralForSafesWithIndex: 'function getTotalCollateralForSafesWithIndex(uint256 startIndex, uint256 n) view returns (tuple(address token, uint256 amount)[])',
}

async function tvl(api) {
  const isCustomJob = getEnv('IS_RUN_FROM_CUSTOM_JOB')
  if (!isCustomJob)
    throw new Error("Find another solution, maybe a custom script that runs slow but pulls all the data, this is making like 200k calls which is running into rate limit")

  //get last collateral mode vault
  const lastCollateralModeVault = (await api.call({
    target: EtherFiCashFactory,
    abi: 'function numContractsDeployed() view returns (uint256)',
  })) - 1;

  const batch_size = 81;


  const calls = [];
  for (let i = 0; i < Number(lastCollateralModeVault); i += batch_size) {
    const startIndex = i;
    const endIndex = Math.min(i + batch_size, lastCollateralModeVault);
    const n = endIndex - startIndex;

    calls.push({
      target: CashBorrowerHelperContract,
      params: [startIndex, n],
    });
  }

  const chunks = sliceIntoChunks(calls, 2);
  let i = 0
  for (const chunk of chunks) {
    const res = await api.multiCall({ abi: abi.getTotalCollateralForSafesWithIndex, calls: chunk })
    res.forEach(batchResult => {
      batchResult.forEach(({ token, amount }) => api.add(token, amount))
    })
    api.log(`Processed chunk ${++i}/${chunks.length}`)
    await sleep(3000)
  }
}

async function borrow(api) {
  const cashDebitCore = '0x0078C5a459132e279056B2371fE8A8eC973A9553'
  const usdcScroll = ADDRESSES.scroll.USDC
  const borrowingAmount = await api.call({
    target: cashDebitCore,
    abi: 'function totalBorrowingAmount(address borrowToken) view returns (uint256)',
    params: [usdcScroll],
  });
  api.add(usdcScroll, borrowingAmount);
}

module.exports = {
  isHeavyProtocol: true,
  scroll: {
    tvl,
    borrowed: borrow,
  },
};
