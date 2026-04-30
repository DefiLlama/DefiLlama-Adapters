const { getAddress, getLogs2 } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json');

const P1USD = "0x1cf1c71440ebd9cc998ce0b1b25ccef275c53d77";
const AAVE_PLASMA_USDT0 = "0x5D72a9d9A9510Cd8cBdBA12aC62593A58930a948";
const USDT0 = ADDRESSES.plasma.USDT0;

const CHECKING_FACTORY = "0x42529Da25D82ba7810D7F51D614915B8c7e11aCC";
const ACCOUNT_CREATED_TOPIC = "0x9a758bc0bde621f0a72a82cdaa0f3652778d9ddb49d46f1ab3e150d3171a8732";

// TVL = Earn Accounts TVL + Checking Accounts TVL
// Earn Accounts TVL = Calculated by adding up the tokens inside the P1USD contract;
// Checking Accounts TVL = Calculated by adding up the tokens inside all checking accounts;

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: CHECKING_FACTORY,
    topic: ACCOUNT_CREATED_TOPIC,
    fromBlock: 6101653,
    useIndexer: true
  });
  
  const checkingContracts = logs.flatMap(log => [
    getAddress(log.topics[1]),
    getAddress(log.topics[2]),
  ]);
  
  await api.sumTokens({ tokens: [USDT0, AAVE_PLASMA_USDT0], owners: [P1USD, ...checkingContracts] });
}

module.exports = {
  plasma: { tvl },
};
