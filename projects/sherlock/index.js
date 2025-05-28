const ADDRESSES = require('../helper/coreAssets.json')

const USDC = ADDRESSES.ethereum.USDC;
const SherlockContract = '0xacbBe1d537BDa855797776F969612df7bBb98215';
const SherlockV2Contract = '0x0865a889183039689034dA55c1Fd12aF5083eabF';

async function tvl(api) {
  await api.sumTokens({ owner: SherlockContract, tokens: [USDC], });
  const SherlockV2TVL = await api.call({ target: SherlockV2Contract, abi: "uint256:totalTokenBalanceStakers", });
  api.add(USDC, SherlockV2TVL);
}

module.exports = {
  methodology: 'We count USDC that has been staked into the contracts (staking pool). Periodically USDC is swept into Aave, so we also count the aUSDC that is held (in a separate contract from the main contract).',
  start: '2021-09-28',            // 9/28/2020 @ 8:00pm (UTC)
  ethereum: { tvl }                           // tvl adapter
}
