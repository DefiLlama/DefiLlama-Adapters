const axios = require('axios');
const { default: BigNumber } = require('bignumber.js');
const { getAddressesUTXOs, getTxsMetadata } = require("../helper/cardano/blockfrost");

async function staking() {
  const aadaLocked = (await axios.get("https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1wyvej5rmcrhfpcwrwmnqsjtwvf8gv3dn64vwy3xzekp95wqqhdkwa", {
    headers: {
      project_id: "mainnetTV9qV3mfZXbE6e44TVGMe1UoRlLrpSQt"
    }
  })).data.amount.find(token => token.unit === "8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f6958741414441").quantity;


  const topPrice = (await axios.get("https://orders.muesliswap.com/orderbook/?policy-id=8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f69587&tokenname=AADA")
  ).data.buy[0].price;

  const cardano = aadaLocked * topPrice;
  // console.log({cardanoStaking: cardano})
  return { cardano };
}

const scriptAdresses = [
  'addr1z89rdvu7tagp6lf2eansz4yhnm0ncs24jle973jc4qzf50tustjqjmgmrrw800v663gpvq8l4evpaxwxtx270nyxx60qxz7da3',
  'addr1zxw4pl7c6c8dh0krxvkjuhdvplclvmf0ythar8y0da5ut0nustjqjmgmrrw800v663gpvq8l4evpaxwxtx270nyxx60qhr7a2u',
  'addr1z95uc4zrsct76wda36asvz5cx7fhecv5v4t7t3d2uphj0dnustjqjmgmrrw800v663gpvq8l4evpaxwxtx270nyxx60qspzxnz',
];
const tvl = async () => {
  let totalLovelaceLocked = 0;
  const mapLovelaceUtxo = ({ amount }) => amount.filter(({ unit }) => unit === 'lovelace').map(({ quantity }) => quantity);
  const sumUtxos = (a, b) => BigNumber.sum(a, b);
  for (const scriptAddress of scriptAdresses) {
    const utxos = await getAddressesUTXOs(scriptAddress);
    const addressTvl = utxos
      .map(mapLovelaceUtxo)
      .reduce(sumUtxos, 0);
    totalLovelaceLocked = BigNumber.sum(totalLovelaceLocked, addressTvl).toNumber();
  }
  const cardano = totalLovelaceLocked / 1e6;
  // console.log({ cardano });
  return { cardano, };
};


module.exports = {
  misrepresentedTokens: true,
  methodology: 'Counts amount of AADA staked; by a price of ADA sitting in the orderbook.',
  timetravel: false,
  cardano: {
    staking,
    tvl
  }
};