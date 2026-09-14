const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// DIEM Relay — Base
// DIEM is Venice.ai's inference-credit token. DIEM Relay is a third-party
// liquid-staking layer on top of it (sDIEM / csDIEM receipts), so staked DIEM
// is user deposits in a third-party asset and counts toward TVL, not `staking`.
const DIEM = '0xF4d97F2da56e8c3098f3a8D538DB630A2606a024';
const DIEM_VAULT = '0xdc9625b026f6Dd17F9d96e608592A9C592e27eEF';

// sDIEM staking contracts (DIEM is forward-staked on Venice under these addresses)
const SDIEM_V1 = '0xdbF05AF4fdAA518AC9c4dc5aA49399b8dd0B4be2';
const SDIEM_V2 = '0x8065228a8156590A8BFca30678394e9db91f80Ee';

// csDIEM ERC-4626 wrappers
// v1: asset() = DIEM (stakes into sDIEM v1 internally)
// v2: asset() = sDIEM v2 (wraps sDIEM v2 à la wstETH; holds no raw DIEM)
const CSDIEM_V1 = '0x4899f5fBA1bf43C8Bea483bE6342e55Bc16e045a';
const CSDIEM_V2 = '0x78B8726929911044748374178CB2D417A54319e5';

// RevenueSplitters route USDC compute revenue to stakers via notifyRewardAmount
const REVENUE_SPLITTER_V1 = '0xd185138CEA135E60CA6E567BE53DEC81D89Ce7D6';
const REVENUE_SPLITTER_V3 = '0x213c8d7434E2ae7AA1C392767c5120778D413215';

const STAKED_INFOS_ABI =
  'function stakedInfos(address) view returns (uint256 amount, uint256 cooldownEnd, uint256 pendingUnstake)';

async function tvl(api) {
  // DIEM forward-staked on Venice via each sDIEM contract.
  // csDIEM v2 wraps sDIEM v2, so its underlying DIEM is already counted in
  // stakedInfos(SDIEM_V2) — counting csDIEM v2 separately would double-count.
  const staked = await api.multiCall({
    target: DIEM,
    calls: [SDIEM_V1, SDIEM_V2],
    abi: STAKED_INFOS_ABI,
  });
  staked.forEach(([amount]) => api.add(DIEM, amount));

  return sumTokens2({
    api,
    tokens: [ADDRESSES.base.USDC, DIEM],
    owners: [
      DIEM_VAULT,
      SDIEM_V1,
      SDIEM_V2,
      CSDIEM_V1,
      CSDIEM_V2,
      REVENUE_SPLITTER_V1,
      REVENUE_SPLITTER_V3,
    ],
  });
}

module.exports = {
  methodology:
    'TVL is DIEM (Venice.ai inference-credit token, not a DIEM Relay governance token) ' +
    'deposited by users and forward-staked on Venice via the sDIEM v1/v2 contracts, plus any ' +
    'liquid DIEM and undistributed USDC compute revenue held by the DIEM Relay vault, the ' +
    'sDIEM/csDIEM contracts and the RevenueSplitter contracts.',
  base: { tvl },
};
