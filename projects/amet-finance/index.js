const { getLogs } = require("../helper/cache/getLogs");
const issuerEventABI = "event BondIssued(address bondAddress)";

const config = {
  base: {
    issuer: "0xE67BE43603260b0AD38bBfe89FcC6fDe6741e82A",
    fromBlock: 12724500
  },
  manta: {
    issuer: null,
  },
  polygon: {
    issuer: null,
  },
  polygon_zkevm: {
    issuer: null,
  }
};

const FixedFlexIssuerABI = {
  payoutToken: "function payoutToken() view returns (address)"
};


async function tvl(api) {
  const { issuer, fromBlock } = config[api.chain];

  if (!issuer) return {};

  const issuerLogs = await getLogs({api, target: issuer, fromBlock, eventAbi: issuerEventABI, onlyArgs: true});
  const bondAddresses = issuerLogs.map(item => item.bondAddress);
  const payoutTokens = await api.multiCall({abi: FixedFlexIssuerABI.payoutToken, calls: bondAddresses});
  const ownerTokens = payoutTokens.map((payoutToken, index) => [[payoutToken], bondAddresses[index]]);
  return await api.sumTokens({ownerTokens});
}

module.exports = {
  methodology: "On DeFiLlama, the TVL (Total Value Locked) calculation for Amet Finance is derived from analyzing issuer logs to identify all issued bonds. We then assess the payout balance held within these bonds. The aggregate of these balances across all bonds represents the TVL for Amet Finance."
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl };
});
