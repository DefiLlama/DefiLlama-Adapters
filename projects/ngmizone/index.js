const { sumTokens } = require("../helper/chain/cosmos");

const ngmiContract = "neutron1xcjn7d2f6p2kjqdxtvm4dzeqay98hcmtts92uugw7efnz4zc05csyhhvq6";

const supportedAssets = [
  "untrn",
];

async function tvl(api) {
  return await sumTokens({
    owners: [ngmiContract],
    chain: "neutron", 
    tokens: supportedAssets,
    api,
  });
}

module.exports = {
  methodology: "Totals the $NTRN balance held by the NGMI.zone contract.",
  neutron: {
    tvl
  }
}