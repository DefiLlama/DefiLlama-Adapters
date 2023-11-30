const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider, } = require('../helper/solana');
const { Program } = require("@project-serum/anchor");
const { getConfig } = require('../helper/cache');
const axios = require("axios");

let stats

async function getStats() {
  if (!stats) stats = fetchStats()
  return stats

  async function getCollections() {
    const collections = (await axios.get(`https://citrus.famousfoxes.com/citrus/allCollections`)).data;
    const collectionsById = {};
    collections.map(c => {
        collectionsById[c.id] = c;
    });
    return collectionsById;
  }

  async function fetchStats() {
    const programId = 'JCFRaPv7852ESRwJJGRy2mysUMydXZgVVhrMLmExvmVp';
    const provider = getProvider();
    // const collectionsById = await getCollections();
    // const idl = await getConfig('citrus-idl', 'https://gist.githubusercontent.com/FoxyDev42/5f23cd03eab33e0d73f6f6227912451e/raw/03e68f7543dc4dd399d7b61e15881c1a6792eb4a/citrus-account.json');
    const program = new Program(idl, programId, provider)
    const loans = await program.account.loan.all()
    const activeLoans = loans.filter(loan => Object.keys(loan.account.status)[0] === 'active');
    const openOffers = loans.filter(loan => Object.keys(loan.account.status)[0] === 'waitingForBorrower');
    const activeLoansTotal = activeLoans.map(loan => loan.account.loanTerms.principal).reduce((a, b) => a.add(b));
    const openOffersTotal = openOffers.map(loan => loan.account.loanTerms.principal).reduce((a, b) => a.add(b));
    // const activeLoansNFTs = activeLoans.map(loan => loan.account.collectionConfig.toBase58()).reduce((a, b) => a + parseFloat(collectionsById[b]?.floor), 0);
    // const tvl = openOffersTotal.toNumber() + activeLoansNFTs * 1e9;
    const tvl = openOffersTotal.toNumber()
    const borrowed = activeLoansTotal.toNumber();
    return { tvl, borrowed }
  }
}

const tvl = async () => {
  return { ['solana:' + ADDRESSES.solana.SOL]: (await getStats()).tvl }
};

const borrowed = async () => {
  return { ['solana:' + ADDRESSES.solana.SOL]: (await getStats()).borrowed }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is amount of SOL available to be borrowed',
  solana: {
    tvl,
    borrowed,
  }
};

const idl =  {
  version: '0.1.0',
  name: 'citrus',
  instructions: [],
  accounts: [
    {
      name: 'loan',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8'
          },
          {
            name: 'lender',
            type: 'publicKey'
          },
          {
            name: 'borrower',
            type: 'publicKey'
          },
          {
            name: 'mint',
            type: 'publicKey'
          },
          {
            name: 'collectionConfig',
            type: 'publicKey'
          },
          {
            name: 'status',
            type: {
              defined: 'LoanStatus'
            }
          },
          {
            name: 'loanTerms',
            type: {
              defined: 'LoanTerms'
            }
          },
          {
            name: 'creationTime',
            type: 'i64'
          },
          {
            name: 'startTime',
            type: 'i64'
          },
          {
            name: 'endTime',
            type: 'i64'
          },
          {
            name: 'fox',
            type: 'bool'
          },
          {
            name: 'mortgage',
            type: 'bool'
          },
          {
            name: 'private',
            type: 'bool'
          },
          {
            name: 'offerType',
            type: {
              defined: 'OfferType'
            }
          },
          {
            name: 'listingPrice',
            type: 'u64'
          },
          {
            name: 'ltvTerms',
            type: {
              option: {
                defined: 'LtvTerms'
              }
            }
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'LoanTerms',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'apyBps',
            type: 'u64'
          },
          {
            name: 'duration',
            type: 'u64'
          },
          {
            name: 'principal',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'LtvTerms',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'ltvBps',
            type: 'u64'
          },
          {
            name: 'maxOffer',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'LoanStatus',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'WaitingForBorrower'
          },
          {
            name: 'WaitingForLender'
          },
          {
            name: 'Active'
          },
          {
            name: 'Repaid'
          },
          {
            name: 'Defaulted'
          },
          {
            name: 'OnSale'
          }
        ]
      }
    },
    {
      name: 'OfferType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Global'
          },
          {
            name: 'Mortgage'
          },
          {
            name: 'Borrow'
          }
        ]
      }
    }
  ],
  events: [],
  errors: []
};