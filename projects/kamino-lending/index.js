const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js');
const { getConnection, sumTokens2, getTokenAccountBalances } = require('../helper/solana');
const { Program } = require('@project-serum/anchor');
const kaminoIdl = require('./kamino-lending-idl.json');
const kaminoFarmsIdl = require('./kamino-farms-idl.json');
const { MintLayout } = require("../helper/utils/solana/layouts/mixed-layout");
const { getConfig } = require('../helper/cache')

const KAMINO_FARMS_PROGRAM_ID = 'FarmsPZpWu9i7Kky8tPN37rs2TpmMrAZrC7S7vJa91Hr';

// Ethena positions held via Kamino KVaults — subtracted since these deposits are already counted in ethena's TVL.
// Ethena holds the KVault receipt token, mostly staked in a Kamino farm. We compute Ethena's pro-rata share of the
// KVault's kToken holdings (farm stake / farm total stake + any unstaked wallet balance) and treat 1:1 with the underlying.
const ETHENA_KVAULT_POSITIONS = [
  {
    farmUserState: '1um6KRX6XodwZ7bgsArLx4aMDx1EvDePJMLK289ZCWn', // tracks ethena's stake in the KVault receipt farm
    walletReceiptAccounts: ['Bh92ZZuYoJfeRxnn3hohpQXwRdAZYxw7o2eu3zDCCY4g'], // any unstaked receipt held by ethena
    kTokenVault: 'GwHpfLMCcScMtXpuLJ6E2a4ANHdHHRZypNnnMVgkH8Zf', // KVault's kUSDG holding
    underlying: '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH', // USDG
  },
  {
    farmUserState: 'CXiSvtSZnqpYf9b4JqLA9NBNBeHnpDELfbbsX8avqj33', // ethena's stake in the kPYUSD receipt farm
    walletReceiptAccounts: ['35h4x1e9LjcHiyr7WeaCEVBPPjARdPCQHYZ5HQJyqtGV'], // unstaked PYUSD receipt held by ethena
    kTokenVault: '22qw3R6Cqt98Np8tVE7HXuDtpH3Yn6Ludmz7x5y3KVqR', // KVault's kPYUSD holding
    underlying: ADDRESSES.solana.PYUSD, // PYUSD
  },
]

async function tvl(api) {
  const connection = getConnection();
  const programId = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
  const markets = (await getConfig('kamino-lending', 'https://api.kamino.finance/v2/kamino-market')).map(x => x.lendingMarket);
  const tokenAccounts = [];
  const ktokens = {};

  const kaminoLendProgram = new Program(kaminoIdl, programId, { connection, publicKey: PublicKey.unique() });
  for (const market of markets) {
    const reserves = await kaminoLendProgram.account.reserve.all([
      { dataSize: 8624 },
      { memcmp: { offset: 32, bytes: market } },
    ]);

    for (const reserveData of reserves) {
      const reserve = reserveData.account;
      if (
        ktokens[reserve.liquidity.mintPubkey] ||
        (await isKToken(new PublicKey(reserve.liquidity.mintPubkey), connection))
      ) {
        ktokens[reserve.liquidity.mintPubkey] = true;
      } else {
        ktokens[reserve.liquidity.mintPubkey] = false;
        tokenAccounts.push(reserve.liquidity.supplyVault.toString());
      }
    }
  }
  await sumTokens2({ api, tokenAccounts })
  await subtractEthenaKVaultDeposits(api, connection)
}

async function subtractEthenaKVaultDeposits(api, connection) {
  const farmsProgram = new Program(kaminoFarmsIdl, new PublicKey(KAMINO_FARMS_PROGRAM_ID), { connection, publicKey: PublicKey.unique() });
  for (const p of ETHENA_KVAULT_POSITIONS) {
    const userState = await farmsProgram.account.userState.fetch(new PublicKey(p.farmUserState));
    const farmState = await farmsProgram.account.farmState.fetch(userState.farmState);
    const totalStakeScaled = farmState.totalActiveStakeScaled.add(farmState.totalPendingStakeScaled);
    if (totalStakeScaled.isZero()) continue;
    const userStakeScaled = userState.activeStakeScaled.add(userState.pendingDepositStakeScaled);
    const stakeFraction = +userStakeScaled.toString() / +totalStakeScaled.toString();

    const accounts = [p.kTokenVault, ...(p.walletReceiptAccounts || [])];
    const balances = await getTokenAccountBalances(accounts, { individual: true, allowError: true });
    const kTokenInVault = +balances[0].amount;
    const unstakedReceipt = balances.slice(1).reduce((a, b) => a + +b.amount, 0);
    const farmReceiptAmount = +farmState.totalStakedAmount.toString();
    const ethenaReceiptAmount = stakeFraction * farmReceiptAmount + unstakedReceipt;

    const totalReceiptSupply = +(await connection.getTokenSupply(farmState.token.mint)).value.amount;
    if (!totalReceiptSupply) continue;
    // ethena's underlying share = (ethena receipts / total receipts) * kVault's kToken holdings, treated 1:1 with underlying
    const underlyingToSubtract = (ethenaReceiptAmount / totalReceiptSupply) * kTokenInVault;
    api.add(p.underlying, -underlyingToSubtract);
  }
}

async function isKToken(mint, connection) {
  const mintInfo = await connection.getAccountInfo(new PublicKey(mint.toString()));
  const rawMint = MintLayout.decode(mintInfo.data.slice(0, MintLayout.span));
  const KAMINO_PROGRAM_ID = new PublicKey('6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc');
  const [expectedMintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('authority'), mint.toBuffer()],
    KAMINO_PROGRAM_ID
  );
  return rawMint.mintAuthority !== null && rawMint.mintAuthority.equals(expectedMintAuthority);
}

async function borrowed(api) {
  const connection = getConnection();
  const programId = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
  const markets = (await getConfig('kamino-lending', 'https://api.kamino.finance/v2/kamino-market')).map(x => x.lendingMarket);
  const ktokens = {};

  const kaminoLendProgram = new Program(kaminoIdl, programId, { connection, publicKey: PublicKey.unique() });
  
  for (const market of markets) {
    const reserves = await kaminoLendProgram.account.reserve.all([
      { dataSize: 8624 },
      { memcmp: { offset: 32, bytes: market } },
    ]);
    for (const reserveData of reserves) {
      const reserve = reserveData.account;
      
      // Skip kTokens like in the tvl function
      if (
        ktokens[reserve.liquidity.mintPubkey] ||
        (await isKToken(new PublicKey(reserve.liquidity.mintPubkey), connection))
      ) {
        ktokens[reserve.liquidity.mintPubkey] = true;
      } else {
        ktokens[reserve.liquidity.mintPubkey] = false;
        
        // Calculate borrowed amount using this formula
        // liquidity.borrowedAmountSf / 2**60 / 10**liquidity.mintDecimals
        const borrowedAmountSf = reserve.liquidity.borrowedAmountSf;
        const borrowedAmount = borrowedAmountSf / Math.pow(2, 60)

        api.add(reserve.liquidity.mintPubkey.toString(), borrowedAmount);
      }
    }
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
  methodology: 'TVL consists of deposits made to the protocol, and borrowed tokens are counted.',
};
