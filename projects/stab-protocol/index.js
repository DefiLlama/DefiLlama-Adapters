const { sumTokens } = require('../helper/chain/radixdlt');

const STAB_COMPONENT = "component_rdx1cq70cjajtvllgk9z9wm9l8v6w8hsgtlw530cdgpraxprn4yevg89kf";
const STAB_XRD_POOL = "pool_rdx1c4jj8lklg7edacflhk0tl202dzgawkujly4kqf0jfehyqd8watxw0r"

async function tvl(api) {
    //get the token amounts of collaterals used in the STAB Protocol and tokens locked in STAB/XRD pool
    await sumTokens({ owners: [STAB_COMPONENT, STAB_XRD_POOL], api })
}

module.exports = {
  methodology: 'Calculates TVL using the amount of collateral locked to borrow STAB using CDPs, and amount of STAB and XRD locked in the protocol-native STAB/XRD pool.',
  radixdlt: { tvl },
  misrepresentedTokens: false,
  timetravel: false,
};
