const { sumTokensExport } = require('../helper/unwrapLPs');

// Offshore Protocol — production deployment on MegaETH mainnet (chainId 4326)
// Source of truth: https://github.com/stealth-town/offshore-protocol
const OFFSHORE_VAULT  = '0x955a4adDc17114C36726c12af9c73E23E497c2bD';
const FACTION_STAKING = '0x3620bbEDED3BcF1b3409098Dc152b0EEcf66eA8e';
const USDM            = '0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7';
const DIRTY           = '0xC2f34f8849a8607FD73E06D6849bDA07C2b7DE38';

module.exports = {
  methodology: 'Tvl: USDM held in the OffshoreVault. Staking: Dirty tokens in the faction staking contract',
  megaeth: {
    tvl:     sumTokensExport({ owner: OFFSHORE_VAULT,  tokens: [USDM]  }),
    staking: sumTokensExport({ owner: FACTION_STAKING, tokens: [DIRTY] }),
  },
};
