const { function_view } = require("../helper/chain/aptos");

const CONSTANTS = {
  PROTOCOL: {
    ADDRESS: '0xed805e77c40d7e6ac5cd3e67514c485176621a2aa21e860cd515121d44a2f83d',
    FUNCTION: 'weusd_operations::get_total_reserves'
  },
  TOKENS: {
    TOKEN_A: '0xa',
    TOKEN_B: '0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d'
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
};

/**
 * Fetches total reserves from the WEUSD protocol
 * @returns {Promise<number[]>} Array of reserve values
 * @throws {Error} If unable to fetch reserves after retries
 */
async function getProtocolReserves(retries = CONSTANTS.MAX_RETRIES) {
  const reserves = await function_view({ 
    functionStr: `${CONSTANTS.PROTOCOL.ADDRESS}::${CONSTANTS.PROTOCOL.FUNCTION}`, 
    type_arguments: [], 
    args: [],
    chain: 'move'
  });

  if (!Array.isArray(reserves) || reserves.length !== 2) {
    throw new Error(`Invalid reserves format: ${JSON.stringify(reserves)}`);
  }

  return reserves;
}

/**
 * Module exports for TVL calculation
 */
module.exports = {
  timetravel: false,
  methodology: "TVL consists of total reserves locked in the WEUSD protocol on Movement blockchain.",
  move: {
    tvl: async (api) => {
      const reserves = await getProtocolReserves();
      api.add(CONSTANTS.TOKENS.TOKEN_A, reserves[0]);
      api.add(CONSTANTS.TOKENS.TOKEN_B, reserves[1]);
    }
  }
};