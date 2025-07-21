const sdk = require('@defillama/sdk')
const { Connection, PublicKey } = require('@solana/web3.js')
const { Program, AnchorProvider, BN } = require("@coral-xyz/anchor");
const { getConnection, getProvider, decodeAccount } = require('../helper/solana');
const loopscaleIdl = require('./loopscale.json');

const endpoint = 'https://loopscale-pricing-adapters-109615290061.europe-west2.run.app/decompile_mints'

const creditbookProgram = (connection) => {
    const provider = new AnchorProvider(
        connection,
        { publicKey: PublicKey.default, signTransaction: (tx) => Promise.resolve(tx), signAllTransactions: (txs) => Promise.resolve(txs) },
        AnchorProvider.defaultOptions()
    );
    const program = new Program(loopscaleIdl, provider);
    return program;
};

async function getLoans(connection) {
  const loansBorrowed = await creditbookProgram(connection).account.loan.all();
  return loansBorrowed;
}

function bytesToNumberLE(bytes) {
    let result = 0n; // Start with BigInt 0
    for (let i = bytes.length - 1; i >= 0; i--) {
        result = (result << 8n) | BigInt(bytes[i]);

	}

    return Number(result);
}

function getCollateralValuesForLoans(loans) {
  const mintBalances = {};
  for(let i = 0; i < loans.length; i++) {
    const collateralData = loans[i].account.collateral[0];
    const collateralMint = collateralData.assetMint;
    const totalCollateral = new BN(collateralData.amount[0].reverse()).toNumber();

    mintBalances[collateralMint] = mintBalances[collateralMint] ? mintBalances[collateralMint] + totalCollateral : totalCollateral;
  }
  return mintBalances;
}

function getOutstandingBalanceForStrategy(strategy, currentTimestamp) {
    // current_deployed_amount
    // plus
    // interest_outstanding
    // plus
    // interest_per_second
    // times
    // (current_timestamp - last_accrued_timestamp)
    const lastAccruedTimestamp = bytesToNumberLE(new Uint8Array(strategy.lastAccruedTimestamp[0]));
    const interestPerSecond = bytesToNumberLE(new Uint8Array(strategy.interestPerSecond[0])) / 1e18;
    const currentDeployedAmount = bytesToNumberLE(new Uint8Array(strategy.currentDeployedAmount[0]));
    const outstandingInterestAmount = bytesToNumberLE(new Uint8Array(strategy.outstandingInterestAmount[0]));
    const unaccruedInterest = interestPerSecond * (currentTimestamp - lastAccruedTimestamp);

    return currentDeployedAmount + outstandingInterestAmount + unaccruedInterest;
}

function getOutstandingDebt(strategies) {
    const strategyBalances = {};
    const currentTimestamp = Math.floor(Date.now() / 1000);

    for(let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i].account;
        const mint = strategy.principalMint.toString();
        const outstandingBalance = getOutstandingBalanceForStrategy(strategy, currentTimestamp);
        strategyBalances[mint] = strategyBalances[mint] ? strategyBalances[mint] + outstandingBalance : outstandingBalance;
    }

    return strategyBalances;
}

function getIdleCapital(strategies) {
    const strategyBalances = {};

    for(let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i].account;
        const mint = strategy.principalMint.toString();
        const unusedBalance = getIdleBalanceForStrategy(strategy);
        strategyBalances[mint] = strategyBalances[mint] ? strategyBalances[mint] + unusedBalance : unusedBalance;
    }

    return strategyBalances;
}

async function getStrategies(connection) {
    const outstandingStrategies = await creditbookProgram(connection).account.strategy.all();
    
    return outstandingStrategies;
}

function getIdleBalanceForStrategy(strategy) {
    const amountExternallySupplied = bytesToNumberLE(new Uint8Array(strategy.externalYieldAmount[0]));
    const amountHeldByStrategy = bytesToNumberLE(new Uint8Array(strategy.tokenBalance[0]));

    return amountExternallySupplied + amountHeldByStrategy;
}

async function getDeposits(connection) {
    const loans = await getLoans(connection);
    const collateralBalances = getCollateralValuesForLoans(loans);

    const strats = await getStrategies(connection);
    const idleCapitalBalances = getIdleCapital(strats);

    let rawDeposits = {};

    for (const obj of [collateralBalances, idleCapitalBalances]) {
      for (const [key, value] of Object.entries(obj)) {
        rawDeposits[key] = (rawDeposits[key] || 0) + value;
      }
    }

    rawDeposits = Object.fromEntries(
        Object.entries(rawDeposits).filter(([key, value]) => value !== 0)
    );
    
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            rawBalances: rawDeposits
        })
    });

    const formattedDeposits = await response.json();

    return formattedDeposits;
}

async function tvl(api) {
  const connection = getConnection();
  const balances = await getDeposits(connection);
  const data = Object.entries(balances).map(([mint, balance]) => ({ mint, balance }));
  api.addTokens(data.map(d => d.mint), data.map(d => d.balance));
}

async function borrowed(api) {
  const connection = getConnection();
  const strategies = await getStrategies(connection);
  const outstandingDebt = getOutstandingDebt(strategies);
  const data = Object.entries(outstandingDebt).map(([mint, balance]) => ({ mint, balance }));
  api.addTokens(data.map(d => d.mint), data.map(d => d.balance));
}

module.exports = {
	doublecounted: false,
	timetravel: false,
	methodology:
		'TVL is calculated by summing up lending deposits and supplied collateral. Borrowed tokens are included.',
	solana: { tvl, borrowed },
}
