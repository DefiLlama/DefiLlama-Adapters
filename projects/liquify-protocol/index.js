const ADDRESSES = require('../helper/coreAssets.json')
const { queryAddresses } = require('../helper/chain/radixdlt');

const LIQUIFY_COMPONENT = "component_rdx1czvsx3kq5j4yfz8d0keq5328txwctmsq2fllqr6rqpn000sl5deuk8";
const XRD_ADDRESS = ADDRESSES.radixdlt.XRD;

module.exports = {
  methodology: 'Calculates TVL using the amount of XRD locked in the Liquify protocol liquidity vault.',
  radixdlt: {
    tvl: async (api) => {
      const data = await queryAddresses({
        addresses: [LIQUIFY_COMPONENT]
      });

      const xrdLiquidityVault = data[0].details.state.fields.find(
        (field) => field.field_name === 'xrd_liquidity'
      ).value;

      const vaultData = await queryAddresses({ 
        addresses: [xrdLiquidityVault] 
      });

      const xrdBalance = vaultData[0].details.balance.amount;
      
      api.add(XRD_ADDRESS, +xrdBalance);
    },
  },
  timetravel: false,
};