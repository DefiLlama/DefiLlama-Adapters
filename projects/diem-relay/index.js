const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// DIEM Relay — Base
const DIEM = '0xF4d97F2da56e8c3098f3a8D538DB630A2606a024';
const DIEM_VAULT = '0xdc9625b026f6Dd17F9d96e608592A9C592e27eEF';
const SDIEM = '0xdbF05AF4fdAA518AC9c4dc5aA49399b8dd0B4be2';
const CSDIEM = '0x4899f5fBA1bf43C8Bea483bE6342e55Bc16e045a';
const REVENUE_SPLITTER = '0xd185138CEA135E60CA6E567BE53DEC81D89Ce7D6';

const STAKED_INFOS_ABI =
  'function stakedInfos(address) view returns (uint256 amount, uint256 cooldownEnd, uint256 pendingUnstake)';

async function tvl(api) {
  return sumTokens2({
    api,
    tokens: [ADDRESSES.base.USDC],
    owners: [DIEM_VAULT, SDIEM, CSDIEM, REVENUE_SPLITTER],
  });
}

async function staking(api) {
  const [veniceStaked] = await api.call({
    target: DIEM,
    params: SDIEM,
    abi: STAKED_INFOS_ABI,
  });
  api.add(DIEM, veniceStaked);
  return sumTokens2({ api, tokens: [DIEM], owners: [CSDIEM] });
}

module.exports = {
  methodology:
    'TVL is USDC held by the DIEM Relay vault, the sDIEM rewards-stream contract, ' +
    'csDIEM, and the RevenueSplitter. Staking is DIEM forward-staked on Venice via sDIEM ' +
    "plus any liquid DIEM held by csDIEM between harvest cycles.",
  base: { tvl, staking },
};
