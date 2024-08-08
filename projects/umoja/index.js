const Address = require( "../helper/coreAssets.json" );
const Http = require( "../helper/http" );

const UMOJA_SYNTH_POOL = "0x7ba46133E8D6075af638ffDc9472AcCFEFb27A2b";

module.exports = {
  arbitrum: {
    tvl: async function ( api )
    {
      const tvl_map = {
        [Address.arbitrum.USDC_CIRCLE]: { amount: 0, decimals: 6 }
      };

      const data = await Http.get( "https://api.protocol.umoja.xyz/tokens/tvl/d-llama" );

      for ( const entry of data )
      {
        if ( entry.currency == "USDC" ) tvl_map[Address.arbitrum.USDC_CIRCLE].amount = entry.tvl;
      }

      for ( const key in tvl_map ) 
      {
        const entry = tvl_map[key];
        const amount = entry.amount * Math.pow( 10, entry.decimals );
        api.add( key, BigInt( Math.trunc( amount ) ) );
      }
    }
  }
};