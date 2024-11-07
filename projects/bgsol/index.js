const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  const [lst] = await Promise.all([
    sumTokens2({
      tokensAndOwners: [
        ['susdabGDNbhrnCa6ncrYo81u4s9GM8ecK2UwMyZiq4X', '9PKigVr684uDNBfQKvGBrwGQ5KYjHQspTPcmLDv8aqS2']
      ],
    })
  ]);

  return {
    ...lst
  };
}

module.exports = {
  timetravel: false,
  methodology: "Bitget Staked SOL (BGSOL) is a tokenized representation on your staked SOL",
  solana: { tvl },
};