const sdk = require("@defillama/sdk");
const HoprSDK = require("@hoprnet/hopr-sdk");

const wxHOPR_TOKEN_SMART_CONTRACT_ADDRESS  = HoprSDK.web3.wxHOPR_TOKEN_SMART_CONTRACT_ADDRESS;
const HOPR_CHANNELS = HoprSDK.web3.DUFOUR.addresses.channels;

async function getwxHoprInSafes(){
  const rez = await fetch("https://stake.hoprnet.org/api/hub/subgraph-dufour", {
    "headers": {
      "content-type": "text/plain;charset=UTF-8",
    },
    "body": "{\n      balances(where: {id: \"all_the_safes\"}) {\n        wxHoprBalance\n      }\n      _meta {\n        hasIndexingErrors\n        deployment\n        block {\n          hash\n          timestamp\n        }\n      }\n    }",
    "method": "POST",
  });
  const json = await rez.json();
  const totalTokensInSafes = json.balances[0].wxHoprBalance;
  return totalTokensInSafes;
}

async function getTotalSupplywxHopr(){
  const rez =  await sdk.api.abi.call({
    target: wxHOPR_TOKEN_SMART_CONTRACT_ADDRESS,
    abi: 'erc20:totalSupply',
    block,
    chain: 'xdai'
  })
  return rez.output;
};

async function getwxHoprInChannels(){
  const rez =  await sdk.api.abi.call({
    target: wxHOPR_TOKEN_SMART_CONTRACT_ADDRESS,
    abi: 'erc20:balanceOf',
    block,
    chain: 'xdai',
    params: [HOPR_CHANNELS],
  })
  return rez.output;
};

async function tvl(){
  const totalTokensInSafes = await getwxHoprInSafes();
  const totalTokensInChannels = await getwxHoprInChannels();
  return parseFloat(totalTokensInSafes) + parseFloat(totalTokensInChannels);
}

module.exports = {
  gnosis: {
    tvl
  },
};