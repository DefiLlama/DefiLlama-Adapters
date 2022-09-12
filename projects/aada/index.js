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
  'addr1zy9940grv28qxz9k82l9gmqd80vfd8a2734e35yzsz9cqktfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9smq5w00', //request.hs -- Request created. Lender to fund
  'addr1zykhtew0z93z6hmgu2ew7kl9puqz0wmafp0f3jypuejkwmrfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9skq4p22', //collateral.hs -- Loan funded. Borrower to repay
  'addr1zxfgvtfgp9476dhmq8fkm3x8wg20v33s6c9unyxmnpm0y5rfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9st8q78h', //interest.hs -- Borrower repaid -- Lender to claim
  'addr1zxcjtxuc7mj8w6v9l3dfxvm30kxf78nzw387mqjqvszxr4mfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9sp92046', //liquidation.hs -- Funds were liquidated. Borrower to claim
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
