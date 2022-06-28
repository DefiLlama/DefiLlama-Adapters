"use-scrict";

const dotenv = require("dotenv");
dotenv.config();
const { BlockFrostAPI } = require("@blockfrost/blockfrost-js");

const smartContractAddress =
  "addr1wxzqzlncct5g0686c07lyuq3q3j2a0t8l88uwdznw99k9asz6z0hq";

const getTVL = async () => {
  const blockFrost = new BlockFrostAPI({
    projectId: "mainnet9mqP0lhGpRfqcUnVjOFaTSK67Z9UdZMM",
    isTestnet: false,
  });
  let utxos = await blockFrost.addressesUtxos(smartContractAddress);

  let utxosWithRedeemer = []; // Only the UTXO with redeemer have actually been taken and are and active loan

  for (let utxo of utxos) {
    const redeemer = await blockFrost.txsRedeemers(utxo.tx_hash);
    if (redeemer.length > 0) utxosWithRedeemer.push(utxo);
  }

  let loanDetails = [];
  for (let i = 0; i < utxosWithRedeemer.length; i++) {
    const details = await blockFrost.txsMetadata(utxosWithRedeemer[i].tx_hash);
    loanDetails.push(details);
  }
  loanDetails = loanDetails.map((x) => x[0].json_metadata);

  const TVL = loanDetails.reduce((x, y) => {
    return x + parseInt(y.AMOUNT);
  }, 0);
  console.log(`The TVL in ${smartContractAddress} is: `, TVL);
  return {
    cardano: TVL / 1e6,
 };
};



module.exports = {
  timetravel: false,
  cardano: {
    getTVL,
  },
};
