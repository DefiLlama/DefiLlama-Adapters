const {
  getAddressesUTXOs,
  getTxsMetadata,
  getTxsRedeemers,
} = require("../helper/chain/cardano/blockfrost");
const { PromisePool } = require("@supercharge/promise-pool");
const { get } = require("../helper/http");

const smartContractAddress =
  "addr1wxzqzlncct5g0686c07lyuq3q3j2a0t8l88uwdznw99k9asz6z0hq";

const tvl_onchain = async () => {
  let utxos = await getAddressesUTXOs(smartContractAddress);

  let utxosWithRedeemer = []; // Only the UTXO with redeemer have actually been taken and are and active loan

  const { errors } = await PromisePool.withConcurrency(10)
    .for(utxos)
    .process(async (utxo) => {
      const redeemer = await getTxsRedeemers(utxo.tx_hash);
      if (redeemer.length > 0) utxosWithRedeemer.push(utxo);
    });

  if (errors && errors.length) throw errors[0];

  let loanDetails = [];

  const { errors: errors1 } = await PromisePool.withConcurrency(10)
    .for(utxosWithRedeemer)
    .process(async (utxo) => {
      const details = await getTxsMetadata(utxo.tx_hash);
      loanDetails.push(details[0].json_metadata);
    });

  if (errors1 && errors1.length) throw errors1[0];

  const TVL = loanDetails.reduce((x, y) => {
    return x + parseInt(y.AMOUNT);
  }, 0);
  return {
    cardano: TVL / 1e6,
  };
};

async function tvl() {
  const dataOffers = await get("https://api.fluidtokens.com/get-available-collection-offers");
  let SC_offers_tvl = 0;
  
  dataOffers.forEach((i) => {
      SC_offers_tvl += parseInt(i.offerData.loanAmnt);
    });
  
  const repay_tvl = parseInt(await get("https://api.fluidtokens.com/get-total-available-repayments"));

  const pools_tvl= parseInt(await get("https://api.fluidtokens.com/get-total-available-pools"));
  return {
    cardano: (SC_offers_tvl+repay_tvl+pools_tvl) / 1e6,
  };
}


async function borrowed(
  ts //timestamp in seconds
) {
  const data = await get("https://api.fluidtokens.com/get-active-loans");
  let SC1_tvl = 0;
  let SC2_tvl = 0;

  const timeNow = ts * 1e3;
  data
    .filter((i) => {
      //select SC1 active inputs
      return i.SCversion == 1 && i.timeToEndLoan >= timeNow;
    })
    .forEach((i) => {
      SC1_tvl += +i.loanData.AMOUNT;
    });
  data
    .filter((i) => {
      //select SC2 inputs
      return i.SCversion == 2;
    })
    .filter((x) => {
      return (
        //filter by active loans
        x.activeLoanData.lendDate +
          x.loanRequestData.loanDuration *
            3.6 *
            1e6 /* hours in milliseconds */ >=
        timeNow
      );
    })
    .forEach((x) => {
      SC2_tvl += parseInt(x.loanRequestData.loanAmnt);
    });
    
  const dataOffers = await get("https://api.fluidtokens.com/get-available-collection-offers");
  let SC_offers_tvl = 0;
  
  dataOffers.forEach((i) => {
      SC_offers_tvl += parseInt(i.offerData.loanAmnt);
    });
  
  return {
    cardano: (SC1_tvl + SC2_tvl) / 1e6,
  };
}


module.exports = {
  methodology: "Count active loaned out ADA as tvl",
  timetravel: false,
  cardano: {
    tvl,
    borrowed,
  },
  hallmarks: [
    [Math.floor(new Date("2023-01-01") / 1e3), "Count only active loans"],
    [Math.floor(new Date("2023-06-27") / 1e3), "ADA loaned out is counted under borrowed"],
  ],
};
