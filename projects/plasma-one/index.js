const { getAddress, getLogs2 } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json');
const { staking } = require('../helper/staking');
const { sliceIntoChunks } = require('../helper/utils');
const { getLowValueCache } = require('../helper/cache/lowValue');

const ACCOUNTS_PER_GROUP = 5000; // accounts read per multiCall; the low-value ones found so far are saved after each group

const P1USD = "0x1cf1c71440ebd9cc998ce0b1b25ccef275c53d77";
const AAVE_PLASMA_USDT0 = "0x5D72a9d9A9510Cd8cBdBA12aC62593A58930a948";
const USDT0 = ADDRESSES.plasma.USDT0;
const WXPL = ADDRESSES.plasma.WXPL;

const CHECKING_FACTORY = "0x42529Da25D82ba7810D7F51D614915B8c7e11aCC";
const ACCOUNT_CREATED_TOPIC = "0x9a758bc0bde621f0a72a82cdaa0f3652778d9ddb49d46f1ab3e150d3171a8732";
const XPL_LOCK = "0xe035A6A5ABa726bD162E273a22fF85AE5f6E04C3";

// TVL = Earn Accounts TVL + Checking Accounts TVL
// Earn Accounts TVL = Calculated by adding up the tokens inside the P1USD contract;
// Checking Accounts TVL = Calculated by adding up the tokens inside all checking accounts;
// Staking = Calculated by adding up the WXPL locked by users (for one year) to unlock higher card tiers within Plasma One;

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: CHECKING_FACTORY,
    topics: [ACCOUNT_CREATED_TOPIC],
    fromBlock: 14534239,
    extraKey: 'checking-accounts',
  });
  
  const checkingContracts = logs.flatMap(log => [
    // topics[1]: Checking account
    getAddress(log.topics[1]),
    // topics[2]: Deposit address that moves funds to checking account
    getAddress(log.topics[2]),
  ]);
  
  const tokens = [USDT0, AAVE_PLASMA_USDT0];
  await api.sumTokens({ owner: P1USD, tokens });

  // Most checking accounts hold next to nothing. An account worth under $100 is stored with its balances,
  // counted from the store, and read again once a week.
  const lowValue = await getLowValueCache({ api, project: 'plasma-one', key: 'checking-accounts', checkpointEvery: ACCOUNTS_PER_GROUP });
  const accounts = lowValue.filter([...new Set(checkingContracts.map(account => account.toLowerCase()))]);

  for (const group of sliceIntoChunks(accounts, ACCOUNTS_PER_GROUP)) {
    const calls = group.flatMap(account => tokens.map(token => ({ target: token, params: account })));
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls, permitFailure: true });
    const results = [];
    group.forEach((account, i) => {
      const held = {};
      tokens.forEach((token, j) => held[token] = balances[i * tokens.length + j]);
      // a failed read is left out of this run only, and the account is read again next run
      if (Object.values(held).some(amount => amount == null))
        Object.entries(held).forEach(([token, amount]) => { if (amount != null) api.add(token, amount) });
      else results.push([account, held]);
    });
    await lowValue.record(results);
  }
  await lowValue.save();
}

module.exports = {
  plasma: {
    tvl,
    staking: staking(XPL_LOCK, WXPL),
  },
};
