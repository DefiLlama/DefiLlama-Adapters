const ADDRESSES = require('../helper/coreAssets.json')
const { Program, } = require("@project-serum/anchor");
const { getConfig } = require('../helper/cache')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');
const { getProvider } = require('../helper/solana')

let data

async function getData() {
  if (!data) data = getAllData()
  return data

  async function getAllData() {
    const programId = '4tdmkuY6EStxbS6Y8s5ueznL3VPMSugrvQuDeAHGZhSt'
    const provider = getProvider()
    const idl = await getConfig('banx-idl', 'https://raw.githubusercontent.com/frakt-solana/banx-public-sdk/master/src/fbond-protocol/idl/bonds.json')
    const program = new Program(idl, programId, provider)

    const bondOfferOffset = 32 + 8;
    const bondTradeTxnOffset = 8;
    const [
      bondOffers,
      bondTradeTxn,
    ] = await Promise.all([
      getFilteredAccounts(program, 'bondOfferV2', bondOfferOffset, [5, 7,]),
      getFilteredAccounts(program, 'bondTradeTransactionV3', bondTradeTxnOffset, [2, 6, 9]),
    ])

    // OffersSum is sum of sol in pools not yet lent out. The borrowedSum is the sum of SOL which has been borrowed and overcollaterized by the value of locked NFTs
    const { offersSum, offersSumUsdc } = bondOffers.reduce(({ offersSum, offersSumUsdc }, offer) => {
      if (offer.account.bondingCurve.bondingType.linearUsdc || offer.account.bondingCurve.bondingType.exponentialUsdc) {
        return { offersSumUsdc: offersSumUsdc + (+offer.account.fundsSolOrTokenBalance) + Math.max(0, +offer.account.bidSettlement), offersSum };
      }
      return { offersSum: offersSum + (+offer.account.fundsSolOrTokenBalance) + Math.max(0, +offer.account.bidSettlement), offersSumUsdc };
    }, { offersSum: 0, offersSumUsdc: 0 });

    const { borrowedSum, borrowedSumUsdc } = bondTradeTxn.reduce(({ borrowedSum, borrowedSumUsdc }, bondTxn) => {
      if (bondTxn.account.lendingToken.usdc) {
        return { borrowedSumUsdc: borrowedSumUsdc + (+bondTxn.account.solAmount), borrowedSum };
      }
      return { borrowedSum: borrowedSum + (+bondTxn.account.solAmount), borrowedSumUsdc };
    }, { borrowedSum: 0, borrowedSumUsdc: 0 });


    return { tvl: offersSum, tvlUsdc: offersSumUsdc, borrowed: borrowedSum, borrowedUsdc: borrowedSumUsdc }
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
