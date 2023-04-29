const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider } = require('../helper/solana')
const BigNumber = require('bignumber.js')
const { PublicKey } = require('@solana/web3.js')
const { Program, } = require("@project-serum/anchor");
const idl = require('./idl')
const MINTS = [
  {
    name: 'Bitcoin',
    mintAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    decimals: 6,
  },
  {
    name: 'Ethereum',
    mintAddress: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
    decimals: 6,
  },
  {
    symbol: 'SOL',
    mintAddress: ADDRESSES.solana.SOL,
    decimals: 9,
  },
  {
    symbol: 'USDC',
    mintAddress: ADDRESSES.solana.USDC,
    decimals: 6,
  },
  {
    symbol: 'SRM',
    mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    decimals: 6,
  },
  {
    symbol: 'USDT',
    mintAddress: ADDRESSES.solana.USDT,
    decimals: 6,
  },
];
const INTERNAL_DECIMALS = 12;

const convertFromBN = (amount, decimals) => {
  const amountStr = new BigNumber(amount.toString());
  const toDivAmount = `1${'0'.repeat(decimals)}`;
  return amountStr.dividedBy(toDivAmount).toNumber();
};

const numberToFixed = (amount, fixed = 2) => {
  return new BigNumber(amount).decimalPlaces(fixed).toNumber();
};

let tokenData

async function _getTokenData() {
  const mainAccountAddress = new PublicKey('6JVfU8Cp2oAQi39YBpTSuozHiZAUa7j4t1gDyF9RDFEi')
  const programId = new PublicKey('J21zqcffYQU2NUJrvAKhqpKZLQK1YaB9dY5kmcxkMQvQ')
  const provider = getProvider()
  const program = new Program(idl, programId, provider)
  const data = await program.account.mainAccount.fetch(mainAccountAddress)

  const { balancesMap, pricesMap, } = data.tokens.reduce((acc, { mint }, i) => {
    acc.pricesMap[mint.toBase58()] = data.prices[i]?.price || new BigNumber(0);
    acc.balancesMap[mint.toBase58()] = data.balances[i]?.balance || {
      borrowTotal: new BigNumber(0),
      depositTotal: new BigNumber(0),
    };
    return acc;
  }, { balancesMap: {}, pricesMap: {}});

  data.balancesMap = balancesMap;
  data.pricesMap = pricesMap;


  const tokens = MINTS.reduce((acc, token, i) => {
    const { mintAddress, decimals } = token;
    const depositTotal = numberToFixed(convertFromBN(data.balancesMap[mintAddress].depositTotal, INTERNAL_DECIMALS), decimals);
    const borrowTotal = numberToFixed(convertFromBN(data.balancesMap[mintAddress].borrowTotal, INTERNAL_DECIMALS), decimals);
    const available = BigNumber.maximum(new BigNumber(depositTotal).minus(borrowTotal), 0);
    const price = convertFromBN(data.pricesMap[mintAddress], INTERNAL_DECIMALS);

    acc[mintAddress] = {
      borrowed: {
        usd: numberToFixed((borrowTotal * price)),
      },
      available: {
        usd: numberToFixed(available * price),
      },
    };
    return acc;
  }, {});

  return tokens
}

async function getTokenData() {
  if (!tokenData) tokenData = _getTokenData()
  return tokenData
}

async function tvl() {
  const data = await getTokenData()
  return {
    tether: Object.values(data).reduce((a, i) => a + i.available.usd, 0)
  }
}

async function borrowed() {
  const data = await getTokenData()
  return {
    tether: Object.values(data).reduce((a, i) => a + i.borrowed.usd, 0)
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  solana: {
    tvl,
    borrowed,
  },
}
