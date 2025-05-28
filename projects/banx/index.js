const ADDRESSES = require('../helper/coreAssets.json')
const { Program } = require('@coral-xyz/anchor');
const { getConfig } = require('../helper/cache')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');
const { getProvider } = require('../helper/solana')

let data

async function getData() {
  if (!data) data = getAllData()
  return data

  async function getAllData() {
    const provider = getProvider()
    const idl = await getConfig('banx-idl', 'https://api.banx.gg/idl')
    const program = new Program(idl, provider)

    const bondTradeTxnOffset = 8;
    const userVaultOffset = 8;
    const [
      bondTradeTxn,
      userVaults,
    ] = await Promise.all([
      getFilteredAccounts(program, 'bondTradeTransactionV3', bondTradeTxnOffset, [2, 6, 9, 13]),
      getFilteredAccounts(program, 'userVault', userVaultOffset, [1]),
    ]);

    const { escrowSum, escrowSumUsdc } = userVaults.reduce(({ escrowSum, escrowSumUsdc }, userVault) => {
      if (userVault.account.lendingTokenType.usdc) {
        return { escrowSum, escrowSumUsdc: escrowSumUsdc + (+userVault.account.offerLiquidityAmount) }
      }
      return { escrowSum: escrowSum + (+userVault.account.offerLiquidityAmount), escrowSumUsdc }
    }, { escrowSum: 0, escrowSumUsdc: 0 })

    const { borrowedSum, borrowedSumUsdc } = bondTradeTxn.reduce(({ borrowedSum, borrowedSumUsdc }, bondTxn) => {
      if (bondTxn.account.lendingToken.usdc) {
        return { borrowedSumUsdc: borrowedSumUsdc + (+bondTxn.account.solAmount), borrowedSum };
      }
      return { borrowedSum: borrowedSum + (+bondTxn.account.solAmount), borrowedSumUsdc };
    }, { borrowedSum: 0, borrowedSumUsdc: 0 });


    return { tvl: escrowSum, tvlUsdc: escrowSumUsdc, borrowed: borrowedSum, borrowedUsdc: borrowedSumUsdc }
  }
}

const tvl = async () => {
  const { tvl, tvlUsdc } = await getData();
  return { ['solana:' + ADDRESSES.solana.SOL]: tvl, ['solana:' + ADDRESSES.solana.USDC]: tvlUsdc }
};

const borrowed = async () => {
  const { borrowed, borrowedUsdc } = await getData();
  return { ['solana:' + ADDRESSES.solana.SOL]: borrowed, ['solana:' + ADDRESSES.solana.USDC]: borrowedUsdc }
};

const getFilteredAccounts = async (program, accountName, offset, indexes) => {
  return (
    await Promise.all(
      indexes.map((i) =>
        program.account[accountName].all([
          {
            memcmp: {
              offset: offset, // number of bytes
              bytes: bs58.encode(Buffer.from([i])), // PerpetualActive
            },
          },
        ]),
      ),
    )
  ).flat();
};


module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  }
};
