const ADDRESSES = require('../helper/coreAssets.json');
const { sumLayerZeroEscrows } = require('../helper/layerzero');

const RISE_EID = 30401;

const bridgeContracts = {
  ethereum: [
    { owner: '0xf43a70B250a86003a952af7A7986CcC243B89D81', token: ADDRESSES.ethereum.USDC, oapp: '0xf43a70B250a86003a952af7A7986CcC243B89D81', dstEid: RISE_EID },
  ],
  base: [
    { owner: '0x82675d0553D802039e6776C006BEb1b820a69d55', token: ADDRESSES.base.USDC, oapp: '0x82675d0553D802039e6776C006BEb1b820a69d55', dstEid: RISE_EID },
  ],
  arbitrum: [
    { owner: '0x82675d0553D802039e6776C006BEb1b820a69d55', token: ADDRESSES.arbitrum.USDC_CIRCLE, oapp: '0x82675d0553D802039e6776C006BEb1b820a69d55', dstEid: RISE_EID },
  ],
};

Object.keys(bridgeContracts).forEach(chain => {
  module.exports[chain] = {
    tvl: sumLayerZeroEscrows({ escrows: bridgeContracts[chain], minDvnQuorum: 2 }),
  };
});

module.exports.timetravel = false;

module.exports.methodology =
  'Counts source-side USDC locked in RISE-specific LayerZero escrow contracts on Ethereum, Base, and Arbitrum. Destination minted OFT supply is excluded. Each escrow is included only if its LayerZero send-side ULN config meets the >=2 verifier quorum (requiredDVNCount + optionalDVNThreshold). Escrows whose OApps run a single-DVN setup (the KelpDAO failure mode) are excluded.';
