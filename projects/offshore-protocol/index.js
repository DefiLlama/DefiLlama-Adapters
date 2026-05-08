const { sumTokensExport } = require('../helper/unwrapLPs');

// Offshore Protocol — production deployment on MegaETH mainnet (chainId 4326)
// Source of truth: https://github.com/stealth-town/offshore-protocol
const OFFSHORE_VAULT  = '0x955a4adDc17114C36726c12af9c73E23E497c2bD';
const FACTION_STAKING = '0x3620bbEDED3BcF1b3409098Dc152b0EEcf66eA8e';
const USDM            = '0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7';
const DIRTY           = '0xC2f34f8849a8607FD73E06D6849bDA07C2b7DE38';

const methodology = [
  'Offshore Protocol is a fully on-chain idle RPG on MegaETH built around a dual-token loop:',
  '$DIRTY is minted as gameplay rewards (Loop 1 trade outcomes) and burned as a sink',
  '(Loop 2 gacha rolls + generator level-ups), while USDM is the external stablecoin',
  'that backs all "real money" flows.',
  '',
  'TVL counts:',
  '  (a) USDM held in the OffshoreVault — backs the in-game Influence currency 1:1',
  '      and accumulates cycle reward pools from liquidated trades.',
  '  (b) DIRTY locked in the FactionStaking contract during 24-hour faction rotations.',
  '',
  'Excluded: in-game item NFTs (no redemption right), Influence supply (1:1 claim',
  'against vault USDM — would double-count), unminted trade rewards, operational',
  'wallet balances, and protocol-owned liquidity in the DIRTY/USDM Kumbaya pool.',
].join('\n');

module.exports = {
  methodology,
  hallmarks: [
    ['2026-05-02', 'Mainnet launch'],
    ['2026-05-06', 'First cycle (rewards live)'],
  ],
  megaeth: {
    tvl:     sumTokensExport({ owner: OFFSHORE_VAULT,  tokens: [USDM]  }),
    staking: sumTokensExport({ owner: FACTION_STAKING, tokens: [DIRTY] }),
  },
};
