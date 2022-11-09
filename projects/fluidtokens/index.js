const { getAddressesUTXOs, getTxsMetadata, getTxsRedeemers } = require("../helper/cardano/blockfrost");
const { PromisePool } = require('@supercharge/promise-pool')

const smartContractAddress =
  "addr1wxzqzlncct5g0686c07lyuq3q3j2a0t8l88uwdznw99k9asz6z0hq";

const tvl = async () => {
  let utxos = await getAddressesUTXOs(smartContractAddress);

  let utxosWithRedeemer = []; // Only the UTXO with redeemer have actually been taken and are and active loan

  const { errors } = await PromisePool.withConcurrency(10)
    .for(utxos)
    .process(async (utxo) => {
      const redeemer = await getTxsRedeemers(utxo.tx_hash)
      if (redeemer.length > 0) utxosWithRedeemer.push(utxo)
    })

  if (errors && errors.length)
    throw errors[0]

  let loanDetails = [];

  const { errors: errors1 } = await PromisePool.withConcurrency(10)
    .for(utxosWithRedeemer)
    .process(async (utxo) => {
      const details = await getTxsMetadata(utxo.tx_hash)
      loanDetails.push(details[0].json_metadata)
    })

  if (errors1 && errors1.length)
    throw errors1[0]

  const TVL = loanDetails.reduce((x, y) => {
    return x + parseInt(y.AMOUNT);
  }, 0);
  return {
    cardano: TVL / 1e6,
  };
};



module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
};
