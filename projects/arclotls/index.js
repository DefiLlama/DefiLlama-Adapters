const USDC = '0x3600000000000000000000000000000000000000';
const RENT_VAULT = '0x18B156cc2aB7cF8173Ee837AcFe41D8A9943Aa2e';
const BUYBACK_VAULT = '0x594045B5200949C3a065525bE7D9C750313b57B2';

async function tvl(api) {
  // The injected API pins all reads to the requested chain and block.
  const [balanceRaw, fundedRaw, claimedRaw, buybackBalanceRaw, queuedRaw] = await Promise.all([
    api.call({ target: USDC, abi: 'erc20:balanceOf', params: [RENT_VAULT] }),
    api.call({ target: RENT_VAULT, abi: 'uint256:totalRentFunded6' }),
    api.call({ target: RENT_VAULT, abi: 'uint256:totalRentClaimed6' }),
    api.call({ target: USDC, abi: 'erc20:balanceOf', params: [BUYBACK_VAULT] }),
    api.call({ target: BUYBACK_VAULT, abi: 'uint256:queuedBuybackUSDC6' }),
  ]);
  const balance = BigInt(balanceRaw);
  const funded = BigInt(fundedRaw);
  const claimed = BigInt(claimedRaw);
  if (claimed > funded) throw new Error('ArcLotls: rent claimed exceeds rent funded');

  const outstanding = funded - claimed;
  const rent = balance < outstanding ? balance : outstanding;
  const buybackBalance = BigInt(buybackBalanceRaw);
  // totalBuybackQueued6() is lifetime funding, not the current unspent queue.
  const queued = BigInt(queuedRaw);
  const buyback = buybackBalance < queued ? buybackBalance : queued;
  api.add(USDC, (rent + buyback).toString());
}

module.exports = {
  start: 1789675442,
  methodology: 'Sum of backed unpaid rent rewards (the lesser of RentVault USDC balance and funded minus claimed rent) and backed pending buybacks (the lesser of BuybackVault USDC balance and queuedBuybackUSDC6). Includes rewards not immediately claimable and buybacks temporarily unable to execute. These are NFT-holder rewards and protocol buyback funds rather than refundable deposits. Excludes unsolicited surplus, spent USDC, treasury and genesis reserves, liquidity pools, LOTL and NFT valuations.',
  arc: { tvl },
};
