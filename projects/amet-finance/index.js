const { getLogs } = require("../helper/cache/getLogs");
const issuerEventABI = "event Create(address indexed issuer, address indexed contractAddress)";

const config = {
  manta: {
    issuer: "0x875B73364432d14EEb99eb0eAC6bAaCbEe6829E2",
    fromBlock: 574206
  },
  polygon: {
    issuer: "0x875B73364432d14EEb99eb0eAC6bAaCbEe6829E2",
    fromBlock: 50204821
  },
  polygon_zkevm: {
    issuer: "0x875B73364432d14EEb99eb0eAC6bAaCbEe6829E2",
    fromBlock: 7860004
  }
};

async function tvl(api) {
  const { issuer, fromBlock } = config[api.chain];

  const logs = await getLogs({ api, target: issuer, fromBlock, eventAbi: issuerEventABI, onlyArgs: true });
  const calls = logs.map(item => item.contractAddress);
  const res = await api.multiCall({ abi: ZCB_Issuer_V1.getInfo, calls });
  const ownerTokens = res.map((v, i) => [[v.interestToken], calls[i]]);
  return api.sumTokens({ ownerTokens });
}

module.exports = {
  start: 1700036718369,
  methodology: "Get the issuer contract logs to understand what bonds were issued and add what is locked in the contract."
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl };
});

const ZCB_Issuer_V1 = {
  getInfo: "function getInfo() view returns (address, uint256, uint256 purchased, uint256, uint256, address investmentToken, uint256 investmentTokenAmount, address interestToken, uint256, uint16, uint256)"
};
