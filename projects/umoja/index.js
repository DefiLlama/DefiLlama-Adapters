const Address = require( "../helper/coreAssets.json" );
const { getLogs } = require( "../helper/cache/getLogs" );

const UMOJA_SYNTH_POOL = "0x7ba46133E8D6075af638ffDc9472AcCFEFb27A2b";

module.exports = {
  arbitrum: {
    tvl: async function ( api )
    {
      const new_positions_pm = getLogs( {
        api: api,
        target: UMOJA_SYNTH_POOL,
        extraKey: "new_positions",
        topic: "0x8b16e6c62e473032c5cbe7f56850592630fc44f3a7b50f5e90cde06252cb55f3",
        eventAbi: "event NewPosition (uint256 tokenID, address user, uint256 collateral, uint256 expiryDate, uint256 strikePrice)",
        fromBlock: 223588842,
        onlyArgs: true,
      } );

      const closed_positions_pm = getLogs( {
        api: api,
        target: UMOJA_SYNTH_POOL,
        extraKey: "closed_positions",
        topic: "0x6a9f995a223866df136b1b7ae42548e6e62ccdf547aaec5d1cb4daafb5bdbe3e",
        eventAbi: "event RefundAndClose (uint256 tokenID, address user, uint256 refund)",
        fromBlock: 223588842,
        onlyArgs: true
      } );

      const [new_positions, closed_positions] = await Promise.all( [new_positions_pm, closed_positions_pm] );

      const closed_positions_map = {};
      for ( const p of closed_positions ) 
      {
        const [nft, user, refund] = p;
        closed_positions_map[nft] = true;
      }

      let tvl = 0n;

      // Calculate TVL by summing the collateral of all open positions.
      for ( const p of new_positions )
      {
        const [nft, user, collateral, expiryDate, strikePrice] = p;
        if ( closed_positions_map[nft] ) continue; // Skip closed positions.
        tvl += collateral;
      }

      api.add( Address.arbitrum.USDC_CIRCLE, tvl );
    }
  }
};