
const { getMultipleAccounts } = require("../helper/solana");
const ADDRESSES = require('../helper/coreAssets.json')

const wallets = [
  'Bn8quTyFj5sN4S7LtcGed11MgTRsagrbBMb7CZWSGH7J',
  'Ey2TzHVAFtahyonQzc9TksC4Ev3Pu5MpF418CFKQbtDP',
];

async function tvl(api) {
    const accounts = await getMultipleAccounts(wallets, api);
    for(const account of accounts){
        const balance = account.lamports;
        api.add(ADDRESSES.solana.SOL, balance);
    }
}

module.exports = {
  methodology: 'Counts the total amount of SOL held in two project-controlled wallets on Solana.',
  start: 339444444,
  solana: {
    tvl,
  },
};
