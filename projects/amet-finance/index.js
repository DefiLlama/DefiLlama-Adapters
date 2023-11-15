const { getLogs } = require("../helper/cache/getLogs");
const { Contract } = require("ethers");
const ZCB_Issuer_V1 = require("./ZCB_V1.json");
const { getProvider } = require("@defillama/sdk");

const Chains = {
  Manta: "manta"
};

const configByChain = {
  [Chains.Manta]: {
    issuer: "0x875B73364432d14EEb99eb0eAC6bAaCbEe6829E2",
    fromBlock: 574206,
    issuerEventABI: "event Create(address indexed issuer, address indexed contractAddress);"
  }
};

async function tvl(_, _1, _2, { api }) {

  const createdContracts = [];
  const config = configByChain[api.chain];

  const logs = await getLogs({
    api,
    target: config.issuer,
    fromBlock: config.fromBlock,
    eventAbi: config.issuerEventABI
  });

  logs.forEach(item => createdContracts.push(item.args.contractAddress));

  for (const contractAddress of createdContracts) {
    const contract = new Contract(contractAddress, ZCB_Issuer_V1, getProvider(api.chain));
    const info = await contract.functions.getInfo();

    const purchased = info[2];
    const investmentToken = info[5];
    const investmentTokenAmount = info[6];
    const interestToken = info[7];


    const balance = await api.call({
      abi: "erc20:balanceOf",
      target: interestToken,
      params: contractAddress
    });

    api.add(interestToken, balance);
    api.add(investmentToken, investmentTokenAmount.mul(purchased));
  }
}


module.exports = {
  start: 1700036718369,
  methodology: "get the logs of the issuer contract to understand what bonds were issued and summing what is locked in the contract and adding the purchased amount",
  [Chains.Manta]: {
    tvl
  }
};
