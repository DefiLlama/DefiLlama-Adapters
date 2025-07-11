const ADDRESSES = require('../helper/coreAssets.json')
const {function_view} = require("../helper/chain/aptos");

const ARCHE_CONTRACT_ADDRESS = "0xbcc40f56a3538c9cc25254f485f48e6f150f9acac53a2e92c6d698a9c1751a0b";
const MOVE_TOKEN_ADDRESS = ADDRESSES.aptos.APT;

async function fetchLockedTokens() {

    // Call arche contract to get the total locked move tokens
    const lockedTokens = await function_view({
        functionStr: `${ARCHE_CONTRACT_ADDRESS}::collateral::total_collateral`,
        type_arguments: [],
        args: ["0xa"],
        chain: 'move'
    })

    return lockedTokens;
}

module.exports = {
    timetravel: false,
    methodology: "Counts the total value of MOVE tokens locked in the MSD protocol",
    move: {
        tvl: async (api) => {
            // Fetch total locked tokens
            const lockedTokens = await fetchLockedTokens();

            // Add the token to the balances
            api.add(MOVE_TOKEN_ADDRESS, lockedTokens);
        }
    }
};
