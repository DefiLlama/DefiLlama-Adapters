const ADDRESSES = require('../helper/coreAssets.json')

const { queryAddresses, sumTokens } = require('../helper/chain/radixdlt');

const STAB_COMPONENT = "component_rdx1cq70cjajtvllgk9z9wm9l8v6w8hsgtlw530cdgpraxprn4yevg89kf";
const STAB_XRD_POOL_XRD_VAULT = "internal_vault_rdx1trk04c3sxffatj5h78w3266c8q07cvjlgq0zx44sask8wsam4q8rup";
const ORACLE_COMPONENT = "component_rdx1cq7zsdqfh0mcwnutrevkz6wtml0vnav5fcmtf7rksmhk48urkyjg9c";

async function tvl(api) {
    //get the token amounts of collaterals used in the STAB Protocol
    const stabComponentTokens = await sumTokens({ owners: [STAB_COMPONENT], api })
    const xrdAmount = stabComponentTokens['radixdlt:resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd']
    const lsuLpAmount = stabComponentTokens['radixdlt:resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf']

    //calculate value of LSULP against XRD to get accurate price data
    const [{ details: { state } }] = await queryAddresses({ addresses: [ORACLE_COMPONENT] } )
    const xrdPrice = state.fields[0].elements[0].fields[1].value
    const lsuLpPrice = state.fields[0].elements[1].fields[1].value
    const lsuLpMultiplier = lsuLpPrice / xrdPrice

    //add XRD and LSULP values to tvl
    api.add('resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd', xrdAmount + lsuLpAmount * lsuLpMultiplier)

    //get the amount of XRD in the protocol native STAB/XRD pool (with 50/50 weights)
    const stabXrdPoolXrdVault = await queryAddresses({ addresses: [STAB_XRD_POOL_XRD_VAULT] });
    const xrdAmountPool = stabXrdPoolXrdVault[0].details.balance.amount;

    //add only XRD value of pool to tvl (STAB value is excluded as backing of STAB tokens are already included in tvl)
    api.add('resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd', xrdAmountPool)
}

module.exports = {
  methodology: 'Calculates TVL using the amount of collateral locked to borrow STAB using CDPs, and amount of STAB and XRD locked in the protocol-native STAB/XRD pool.',
  radixdlt: { tvl },
  misrepresentedTokens: true,
  timetravel: false,
};
