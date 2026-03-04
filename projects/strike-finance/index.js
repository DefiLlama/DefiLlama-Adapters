const { getAccountAddresses } = require("../helper/chain/cardano/blockfrost");
const { sumTokens2 } = require("../helper/chain/cardano");

const strikeStakeAccount = "stake1uyd2hj6j4848mdrdln7x8fc6hpunw5ft6yct2rtzafzrt9qh0m28h"
const strikeStaking =
  "addr1z9yh4zcqs4gh78ysvh8nqp40fsnxg49nn3h6x25az9k8tms6409492020k6xml8uvwn34wrexagjh5fsk5xk96jyxk2qf3a7kj";
const strikeTokenAddress =
  "f13ac4d66b3ee19a6aa0f2a22298737bd907cc95121662fc971b5275535452494b45";
  

async function tvl() {
  const addresses = (await getAccountAddresses(strikeStakeAccount))
    .map(a => a.address)
    .filter(addr => addr !== strikeStaking);
  return await sumTokens2({
    owners: addresses
  });
}

async function stake() {
  return await sumTokens2({
    owner: strikeStaking,
    tokens: [strikeTokenAddress],
  });
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
    staking: stake,
  },
};
