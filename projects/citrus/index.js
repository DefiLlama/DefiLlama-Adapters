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
    const idl = await getConfig('citrus-idl', 'https://gist.githubusercontent.com/FoxyDev42/5f23cd03eab33e0d73f6f6227912451e/raw/03e68f7543dc4dd399d7b61e15881c1a6792eb4a/citrus-account.json');
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
  return { ['solana:So11111111111111111111111111111111111111112']: (await getStats()).tvl }
};

const borrowed = async () => {
  return { ['solana:So11111111111111111111111111111111111111112']: (await getStats()).borrowed }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is amount of SOL available to be borrowed',
  solana: {
    tvl,
    borrowed,
  }
};