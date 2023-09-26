const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider, } = require('../helper/solana');
const { Program } = require("@project-serum/anchor");
let stats

async function getStats() {
  if (!stats) stats = fetchStats()
  return stats

  async function fetchStats() {
    const programId = 'JCFRaPv7852ESRwJJGRy2mysUMydXZgVVhrMLmExvmVp';
    const provider = getProvider();
    const program = new Program(idl, programId, provider)
    const loans = await program.account.loan.all()
    const activeLoans = loans.filter(loan => ['active', 'onSale'].includes(Object.keys(loan.account.status)[0]));
    const openOffers = loans.filter(loan => Object.keys(loan.account.status)[0] === 'waitingForBorrower');
    const activeLoansTotal = activeLoans.map(loan => loan.account.loanTerms.principal).reduce((a, b) => a.add(b));
    const openOffersTotal = openOffers.map(loan => loan.account.ltvTerms ? loan.account.ltvTerms.maxOffer : loan.account.loanTerms.principal).reduce((a, b) => a.add(b));
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
      "name": "collectionConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collectionKey",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "creators",
            "type": {
              "option": {
                "array": [
                  "publicKey",
                  3
                ]
              }
            }
          },
          {
            "name": "merkleRoot",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "feeReduction",
            "type": {
              "option": "u16"
            }
          }
        ]
      }
    },
    {
      "name": "loan",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "lender",
            "type": "publicKey"
          },
          {
            "name": "borrower",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "collectionConfig",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "LoanStatus"
            }
          },
          {
            "name": "loanTerms",
            "type": {
              "defined": "LoanTerms"
            }
          },
          {
            "name": "creationTime",
            "type": "i64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "fox",
            "type": "bool"
          },
          {
            "name": "mortgage",
            "type": "bool"
          },
          {
            "name": "private",
            "type": "bool"
          },
          {
            "name": "offerType",
            "type": {
              "defined": "OfferType"
            }
          },
          {
            "name": "listingPrice",
            "type": "u64"
          },
          {
            "name": "ltvTerms",
            "type": {
              "option": {
                "defined": "LtvTerms"
              }
            }
          },
          {
            "name": "pool",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "borrowAuthority",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ],
  types: [
    {
      "name": "LoanTerms",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apyBps",
            "type": "u64"
          },
          {
            "name": "duration",
            "type": "u64"
          },
          {
            "name": "principal",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "LtvTerms",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ltvBps",
            "type": "u64"
          },
          {
            "name": "maxOffer",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "MerkleData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "proof",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "Cpi",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "bytes"
          },
          {
            "name": "numAccounts",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "LoanStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WaitingForBorrower"
          },
          {
            "name": "WaitingForLender"
          },
          {
            "name": "Active"
          },
          {
            "name": "Repaid"
          },
          {
            "name": "Defaulted"
          },
          {
            "name": "OnSale"
          }
        ]
      }
    },
    {
      "name": "OfferType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Global"
          },
          {
            "name": "Mortgage"
          },
          {
            "name": "Borrow"
          }
        ]
      }
    }
  ],
  events: [],
  errors: []
};
