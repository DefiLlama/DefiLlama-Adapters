const { sumTokens2 } = require('../helper/unwrapLPs');

// --- CONSTANTS ---
// On 2026-10-22 Aerodrome migrated to Aero on Base. iAERO's backing moved from veAERO NFTs
// held by the PermalockVault (0x180DAB53968e599Dd43CF431E27CB01AA5C37909) into a permanent
// stake on the Aero VotingEscrow.
const AERO_TOKEN = '0x3f5bF3EdAc59d650D8fDf9657a71F2f904A3a4Ee'; // Aero AERO (new token)
const iAERO_TOKEN = '0x81034fb34009115f215f5d5f564aac9ffa46a1dc';
const AERO_VOTING_ESCROW = '0xBF7977E1521e9a3032bf7243Ee4712f311f13915';

// Permanent Aero stakes that back iAERO. Update this list if the stake is moved or re-issued
// (e.g. when the sAERO vault takes custody of it).
const STAKE_IDS = [1584];

const PEG_DEFENDER = '0x7961523a81cc89beb33f2f140255213a6433cdbd';
const POOL_V2 = '0x72Decb30DFE4F6Cf7Db3ba1D58411dDda5ed903b'; // Aero vAMMV2-AERO/iAERO

const ABI = {
  staked: 'function staked(uint256) view returns (uint128 amount, uint48 end, bool isPermanent)',
};

async function tvl(api) {
  // AERO side of the protocol-owned AERO/iAERO liquidity held by the Peg Defender
  await sumTokens2({ api, owner: PEG_DEFENDER, tokens: [POOL_V2], resolveLP: true });
  api.removeTokenBalance(iAERO_TOKEN); // we dont treat project's own token as TVL

  // AERO permanently staked on the Aero VotingEscrow
  const stakes = await api.multiCall({ target: AERO_VOTING_ESCROW, abi: ABI.staked, calls: STAKE_IDS });
  stakes.forEach(({ amount }) => api.add(AERO_TOKEN, amount));
}

module.exports = {
  methodology: 'TVL is the AERO permanently staked on the Aero VotingEscrow that backs iAERO, plus the AERO side of the AERO/iAERO liquidity owned by the Peg Defender. iAERO itself is excluded.',
  base: {
    tvl
  }
};
