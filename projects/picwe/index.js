const ADDRESSES = require('../helper/coreAssets.json')
const { function_view } = require("../helper/chain/aptos");
const { sumTokens2 } = require('../helper/unwrapLPs')

const CONSTANTS = {
  PROTOCOL: {
    ADDRESS: '0xed805e77c40d7e6ac5cd3e67514c485176621a2aa21e860cd515121d44a2f83d',
    FUNCTION: 'weusd_operations::get_total_reserves'
  },
  TOKENS: {
    TOKEN_A: '0xa',
    TOKEN_B: ADDRESSES.move.USDT
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
};

const picwe = {
  abi: {
    totalSupply: "uint256:totalSupply",
    c: "uint256:c",
  },
  marketAddress: {
    ihp: "0x90bd884ca808173de0b605aa4fabfeb105933d08",
    ucar: "0x608376b122322582d22eeb6e51dd0265cb922b14",
  },
  rwaToken: {
    ihp: "0x3fed4274cce069f6e5b21c643aee874d2205f610",
    ucar: "0x5bdc43507550a414e6970d6e43531f8031e34471",
  }
}
const mintRedeem = '0x5D54f1092FD1750A3ab96972dc1867c5B23eF22C';

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
  },
  base: {
    tvl: async (api) => {
      const baseUsdc = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
      return sumTokens2({owner: mintRedeem, tokens: [baseUsdc], api: api})
    }
  },
  arbitrum: {
    tvl: async (api) => {
      const arbitrumUsdc = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
      return sumTokens2({owner: mintRedeem, tokens: [arbitrumUsdc], api: api})
    }
  },
  bsc: {
    tvl: async (api) => {
      const bscUsdc = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d';
      await sumTokens2({owner: mintRedeem, tokens: [bscUsdc], api: api});
      const tokens = [picwe.rwaToken.ihp, picwe.rwaToken.ucar];
      const totalSupplies = await api.multiCall({abi: picwe.abi.totalSupply, calls: tokens});
      const cs = await api.multiCall({abi: picwe.abi.c, calls: [picwe.marketAddress.ihp, picwe.marketAddress.ucar]});
      api.add(bscUsdc, (totalSupplies[0] * cs[0] + totalSupplies[1] * cs[1]) / 1e18);
    }
  }
};