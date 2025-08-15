const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const USDC_WORLDCHAIN = ADDRESSES.wc.USDC_e
const Magnify_Cash_V1 = '0x4E52d9e8d2F70aD1805084BA4fa849dC991E7c88';
const Magnify_Cash_V2 = '0x93dbB2d447F0086aF60B2becc66598fe3D9135A1';

const tvl = async (api) => {
  const balanceV1 = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_WORLDCHAIN,
    params: [Magnify_Cash_V1],
  });

  const balanceV2 = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_WORLDCHAIN,
    params: [Magnify_Cash_V2],
  });

  api.add(USDC_WORLDCHAIN, balanceV1);
  api.add(USDC_WORLDCHAIN, balanceV2);

}
const totalBorrowed = async (api) => {

  const logsBorrowV1 = await getLogs({
    api,
    target: Magnify_Cash_V1,
    fromBlock: 8116814,
    eventAbi: "event LoanRequested (uint256 indexed tokenId, uint256 amount, address borrower)",
    onlyArgs: true,
    extraKey: 'borrow-v1'
  });

  const logsRepaidV1 = await getLogs({
    api,
    target: Magnify_Cash_V1,
    fromBlock: 8141647,
    eventAbi: "event LoanRepaid (uint256 indexed tokenId, uint256 repaymentAmount, address borrower)",
    onlyArgs: true,
    extraKey: 'repay-v1'
  });

  const logsBorrowV2 = await getLogs({
    api,
    target: Magnify_Cash_V2,
    fromBlock: 10253325,
    eventAbi: "event LoanRequested (uint256 indexed tokenId, uint256 amount, address borrower)",
    onlyArgs: true,
    extraKey: 'borrow-v2'
  });

  const logsRepaidV2 = await getLogs({
    api,
    target: Magnify_Cash_V2,
    fromBlock: 10253325,
    eventAbi: "event LoanRepaid (uint256 indexed tokenId, uint256 repaymentAmount, address borrower)",
    onlyArgs: true,
    extraKey: 'repay-v2'
  });

  // Only 2 types of loans 1 USDC and 10 USDC, fixed repayment amount
  const amountWithoutInterest = (repaymentAmount) => {
    if (repaymentAmount === BigInt(10150000)) {
      return BigInt(10000000);
    } else if (repaymentAmount === BigInt(1025000)) {
      return BigInt(1000000);
    } else {
      return repaymentAmount;
    }
  }

  const totalBorrowAmount =  [...logsBorrowV1, ...logsBorrowV2].reduce((sum, log) => sum + log.amount, BigInt(0));
  const totalRepayAmount = [...logsRepaidV1, ...logsRepaidV2].reduce((sum, log) => sum + amountWithoutInterest(log.repaymentAmount), BigInt(0));
  const netBorrowed = totalBorrowAmount - totalRepayAmount;

  api.add(USDC_WORLDCHAIN, netBorrowed);
}
  
module.exports = {
  methodology: 'Count TVL by getting balance of USDC in V1, V2 Contracts. Counts total active borrowed using LoanRequested events subtracted by LoanRepaid events from V1 and V2 Contracts',
  wc: {
    tvl: tvl,
    borrowed: totalBorrowed,
  }
}; 