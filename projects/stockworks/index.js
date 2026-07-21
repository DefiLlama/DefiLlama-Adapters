const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// StockWorks (SPCXSTR) — stock-token strategy flywheel on Robinhood Chain.
// A 10% pool-level swap tax accumulates ETH in the SpcxController treasury,
// which runs a standing Chainlink-capped bid for SPCX (Robinhood tokenized
// SpaceX stock), relists acquisitions at a premium, and burns SPCXSTR with
// 100% of sale proceeds.
const CONTROLLER = '0x57024Aae99f709Bd399252767DDC6487Aa3881De'
const SPCX = '0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa'

module.exports = {
  methodology:
    'TVL is the protocol treasury (SpcxController): native ETH accumulated from the swap tax forming the standing SPCX bid, plus SPCX (Robinhood tokenized SpaceX stock) acquired by the flywheel and listed for resale.',
  start: '2026-07-20',
  robinhood: {
    tvl: sumTokensExport({ owner: CONTROLLER, tokens: [ADDRESSES.null, SPCX] }),
  },
}
