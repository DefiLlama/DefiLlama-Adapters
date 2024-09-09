const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens } = require('./helper/chain/near');

const GRID_CONTRACT_ID = 'grid.deltatrade.near';
const DCA_CONTRACT_ID = 'dca.deltatrade.near';

const tokens = [
  'wrap.near',
  '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
  'token.v2.ref-finance.near',
  ADDRESSES.near.BURROW,
  'token.lonkingnearbackto2024.near',
  'blackdragon.tkn.near',
  'ftv2.nekotoken.near',
  'gear.enleap.near',
  'token.0xshitzu.near',
  'edge-fast.near',
  '802d89b6e511b335f05024a65161bce7efc3f311.factory.bridge.near',
]

module.exports = {
  timetravel: false,
  near: {
    tvl: () => sumTokens({ tokens, owners: [GRID_CONTRACT_ID, DCA_CONTRACT_ID] }),
  },
}
