const CHAIN       = 'xp';
const LOCKUP      = '0x43A15af1D18B8159bA06df4ec66190451e1f4D70';
const NATIVE_ADDR = '0x8c290B96768210Dc1Ab64970Ff62F0F97be00431';
const BATCH_SIZE  = 100;

const ABI = {
  getLockedAccountsCount: 'uint256:getLockedAccountsCount',
  getLockedAccounts: 'function getLockedAccounts(uint256 offset, uint256 limit) view returns (address[])',
};

async function tvl(_ts, _eb, _cb, { api }) {
  const total = Number(await api.call({
    target: LOCKUP,
    abi: ABI.getLockedAccountsCount,
  }));

  const owners = [];
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = await api.call({
      target: LOCKUP,
      abi: ABI.getLockedAccounts,
      params: [i, BATCH_SIZE],
    });
    owners.push(...batch);
  }

  let sum = 0n;
  for (const addr of owners) {
    const balance = await api.provider.getBalance(addr);
    console.log(`Address: ${addr}, Balance: ${balance}`);
    sum += BigInt(balance.toString());
  }

  return {
    [`${CHAIN}:${NATIVE_ADDR}`]: sum.toString()
  };
}

module.exports = {
  timetravel: true,
  start: 1744859889,
  methodology: `
    	1.	Retrieve all locked user addresses by calling getLockedAccountsCount and getLockedAccounts from the Lockup contract.
	    2.	For each address, fetch the current XP balance using api.provider.getBalance, which reflects both the locked amount and accrued rewards.
	    3.	Sum all balances to calculate the total value of native XP held across the locked accounts, and return this as the protocol’s TVL.
  `,
  [CHAIN]: { tvl },
};