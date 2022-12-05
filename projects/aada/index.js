const axios = require('axios');
const { default: BigNumber } = require('bignumber.js');
const { getAddressesUTXOs, getAssets, } = require("../helper/chain/cardano/blockfrost");

async function staking() {
  const stakingContract = 'addr1wyvej5rmcrhfpcwrwmnqsjtwvf8gv3dn64vwy3xzekp95wqqhdkwa'
  const aadaLocked = (await getAssets(stakingContract)).find(token => token.unit === "8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f6958741414441").quantity;

  return { 
    'aada-finance': aadaLocked / 1e6,
   }
}

const scriptAdresses = [
  'addr1zy9940grv28qxz9k82l9gmqd80vfd8a2734e35yzsz9cqktfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9smq5w00', //request.hs -- Request created. Lender to fund
  'addr1zykhtew0z93z6hmgu2ew7kl9puqz0wmafp0f3jypuejkwmrfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9skq4p22', //collateral.hs -- Loan funded. Borrower to repay
  'addr1zxfgvtfgp9476dhmq8fkm3x8wg20v33s6c9unyxmnpm0y5rfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9st8q78h', //interest.hs -- Borrower repaid -- Lender to claim
  'addr1zxcjtxuc7mj8w6v9l3dfxvm30kxf78nzw387mqjqvszxr4mfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9sp92046', //liquidation.hs -- Funds were liquidated. Borrower to claim
];
const tvl = async () => {
  let tvlLocked = {};
  const tokenPairsUrl = 'https://api-mainnet-prod.minswap.org/coinmarketcap/v2/pairs';
  const res = await axios.get(tokenPairsUrl);
  let pairs;
  if (res.data) {
    pairs = res.data;
  }

  for (const scriptAddress of scriptAdresses) {
    const utxos = await getAddressesUTXOs(scriptAddress);
    utxos.map(utxo => utxo.amount)
      .reduce((a, b) => a.concat(b), [])
      .forEach(amount => {
        const { unit, quantity } = amount;
        if (!tvlLocked[unit]) {
          tvlLocked[unit] = {
            value: 0,
            valueLovelace: 0,
          };
        }
        tvlLocked[unit].value = BigNumber.sum(quantity, tvlLocked[unit].value).toNumber();
        const pair = pairs[`${unit}_lovelace`];
        if (pair) {
          if (!tvlLocked[unit].valueLovelace) {
            tvlLocked[unit].valueLovelace = 0;
          }
          const valueLovelace = BigNumber.sum(new BigNumber(quantity).multipliedBy(pair.last_price), tvlLocked[unit].valueLovelace);
          tvlLocked[unit].valueLovelace = valueLovelace.toNumber();
        }
      });
  }

  const totalLovelaceLocked = Object.entries(tvlLocked).map(([id, values]) => id === 'lovelace' ? values.value : values.valueLovelace).reduce((a, b) => BigNumber.sum(a, b).toNumber(), 0);
  console.log({ totalLovelaceLocked });
  const cardano = totalLovelaceLocked / 1e6;
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
