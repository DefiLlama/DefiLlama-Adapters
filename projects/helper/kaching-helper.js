const sdk = require('@defillama/sdk');
const { function_view } = require('../helper/chain/aptos');

const MODULE_ADDRESS = "0x7d0edbf4a540fc8421e3dbabf221d291217718859814220684c378e8c69da31d";
const MICRO_UNIT = 1_000_000;

async function getTreasuryDetails() {
  try {
    const res = await function_view({
      functionStr: `${MODULE_ADDRESS}::lotto_pots::get_treasury_details`,
      type_arguments: [],
      args: []
    });

    const vault = res?.vault_balance ?? res?.[0]?.vault_balance ?? res?.[0] ?? "0";
    return BigInt(vault.toString());
  } catch (e) {
    sdk.log("Error fetching treasury:", e.message);
    return 0n;
  }
}

async function getPotListPaged(start, size) {
  try {
    const res = await function_view({
      functionStr: `${MODULE_ADDRESS}::lotto_pots::get_pot_list_paged`,
      type_arguments: [],
      args: [String(start), String(size)]   // ensure strings
    });

    const pots = Array.isArray(res) ? res : (res?.[0] || []);

    return pots.map(row => ({
      status: mapStatus(Number(row.status)),
      prizePool: BigInt(row.prize_pool?.toString() || "0")
    }));
  } catch (e) {
    sdk.log(`Error fetching pots (start=${start}):`, e.message);
    return [];
  }
}

function mapStatus(code) {
  const map = {
    1: 'ACTIVE',
    2: 'PAUSED',
    3: 'DRAWN',
    4: 'CANCELLED',
    5: 'COMPLETED',
    6: 'CANCELLATION_IN_PROGRESS',
    7: 'WINNER_ANNOUNCEMENT_IN_PROGRESS'
  };
  return map[code] || 'UNKNOWN';
}

async function getActivePotsTotalBalance() {
  let total = 0n;
  let index = 0;
  const page = 50;

  while (true) {
    const pots = await getPotListPaged(index, page);
    if (pots.length === 0) break;

    for (const pot of pots) {
      if (pot.status === "ACTIVE" || pot.status === "PAUSED") {
        total += pot.prizePool;
      }
    }

    if (pots.length < page) break;
    index += page;
  }

  return total;
}

// ===== MAIN TVL FUNCTION (returns number, not object) =====
async function aptosTVL() {
  try {
    const treasury = await getTreasuryDetails();
    const activePots = await getActivePotsTotalBalance();
    const totalMicro = treasury + activePots;
    const totalUSD = Number(totalMicro) / MICRO_UNIT;

    return totalUSD;          
  } catch (err) {
    return 0;
  }
}

module.exports = { aptosTVL };