const retry = require("../helper/retry");
const axios = require("axios");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

const apiKey = "UZC789UVNGW1UDUUZAQXD562CEG64JWTAE";
const assets = {
  bsc: {
    "0x922a05bf1b7e07cf27d3f5fadc8133e00c75b75f": "bitcoin",
    "0xb7141b1a194e9d5e32711917c68fee5db7778e65": "ethereum",
    "0xa57963d8cb08c157d46862d77be4c0e6b5675494": "litecoin",
    "0x24fcff967fc28afced3c4891b86c1db56d33020e": "cardano",
    "0xae35b15e58eaee102fc5c575cea17b8b6ca3dcb6": "polygon",
    "0x54e67c935c5dc9634bcc16f86e6f5747a76b2da4": "avalanche",
    "0x1ad5021af1d2be561c4a086bb1e0015803c3810f": "iost",
    "0xb2a04c839b9f91889f333e661c9c51deaa6e642d": "dash",
    "0x28cf5786dbc2e9ecc1e5b8fd8a2fce005f095c06": "ripple",
    "0xf3e94c72889afba13ba53898d22717821883e1a5": "stellar",
    "0x52a86ed7d5bed75c876ec9fd44d259375f623ac0": "dogecoin",
    "0x31ef831ff9f4e4bd88cb3c1f6c6c5d33c89cb6fd": "bitcoin-cash",
    "0x941661c8066e0ef6050dcbb84891a77d9db1a20e": "zcash",
    "0x186b614883e57cd31b67b7ae417098aac732010c": "bitcoin-sv",
    "0x60aa3676582a1369a79ae415122470f245fbc5a8": "frontier",
    "0x1d9f90c145df4950a50e7637a8b4066b90727159": "fantom",
    "0xd7110c535aedbe0edaedab40cbc74cc7f45fc9e7": "loom-network",
    "0xf3e94c72889afba13ba53898d22717821883e1a5": "knit-finance",
  },
  eth: { "0xef53462838000184f35f7d991452e5f25110b207": "knit-finance" },
  matic: {
    "0x94e152511588e79f6db10e7c879d4bad437107af": "ethereum",
    "0xeB062AD3FE3fDa9cb20e0466E4F023b557Df116B": "bitcoin",
    "0xF5529E7ff8b0587eD4d243573bC9697A4D12BfBD": "litecoin",
    "0x3f44e746D31cd00BB1968Bf4e2E5E61895814E92": "cardano",
    "0x9485ADfDcD26F56F9b55cE189905B27845558850": "polygon",
    "0x005Ed6E17c748BDbDa3262c361A317aA3DbBC2fc": "avalanche",
    "0x0ACEBF7Fcf36575aF1e93432eF0e75516e05D50E": "iost",
    "0x248d0134BA0E931E48c525843a4C0029B20D2956": "dash",
    "0x96729c6De16693D9C9b2013E22842e3eaDcFFE31": "ripple",
    "0x03c8fB4716AB826041E6d447c0B3916FEEEFADFE": "stellar",
    "0xe4b2D5b0967758DAe4677C02A7b4440d7251F86D": "dogecoin",
    "0x778C9a3073fac0ED6f2b561109989E23c7AD05A6": "bitcoin-cash",
    "0x0Dcd7A5DF109057332344Ef6A27C2D68031BBb3B": "zcash",
    "0x85e773d0Ff19d9Bb00ed0BD0271d72c77C72a2D4": "bitcoin-sv",
    "0x2dc1cc99f5E6F72197236fe1e30921EB863E38b5": "frontier",
    "0x555B1774b6419dC41D917EC47B1f4fBB76e69d68": "fantom",
    "0x710BC8cD80F812e1E51468f120617136EA8fc3Ca": "loom-network",
    "0xC8DDB51cE5002c1984c96926022Ce20B06f11339": "knit-finance",
  },
  fantom: {
    "0x251f6a75192d0003d0ebc7abddc1795354df674e": "bitcoin",
    "0xb06b4ab0d83b6f1a12ff5391daa8fae39a7d5ba2": "ethereum",
    "0x67dbaA721dA715738011Cc193dB65f0D239004b4": "litecoin",
    "0x5242F261B948f4d9aBf21b33E348D3eFaF031ae3": "cardano",
    "0xEdCd6F462E8a96F596ED33f987D7DA0090E057B0": "polygon",
    "0x89E96B056fb758a8a382454b0bd7ff78d59d6EC7": "avalanche",
    "0x16e7B66D0Bf7400C35EDFc0CF46293cE63337C3B": "iost",
    "0xa9A9616d569C38Dd0323A3aED52459D21570DBEd": "dash",
    "0xAAFc50ac5C03555085F555a2B7c139B6EE058CA2": "ripple",
    "0xe401744b34f44CeEfCFa2bA66eae9F1E448F0bd6": "stellar",
    "0xf9AE9267C74cA2d8B50883e7D22D438Bf2878DdC": "dogecoin",
    "0xe296E335643E81fDAab56652DBD3Ef5fF0c64133": "bitcoin-cash",
    "0x28db80024472D67A0d7249389299dF2b14c0eFeC": "zcash",
    "0x8ebF9699406986d5F28fEEa3Be3dd053Ea0F65b9": "bitcoin-sv",
    "0x11B3d4F5786487d72F7814395a5455f213609bcf": "frontier",
    "0x5F3b083B1571f92a67894a989f035BdBf1ee7729": "fantom",
    "0x7621F2bd65624a579a9483c7d2B126c8877545b9": "loom-network",
    "0xaEAB17e79C40bFccC477746CE77B661aa724CDfc": "knit-finance",
  },
};

const apiPath = {
  bsc: {
    base_url: "https://api.bscscan.com",
    api_key: "H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG",
  },
  eth: {
    base_url: "https://api.etherscan.com",
    api_key: "UZC789UVNGW1UDUUZAQXD562CEG64JWTAE",
  },
  matic: {
    base_url: "https://api.polygonscan.com",
    api_key: "M2Y1KZE5BUJP8DBCCDGWVSDJYCHXCPDVYK",
  },
};

const getTokenSupply = (contractaddress, network) => {
  return axios.get(
    `${apiPath[network].base_url}/api?module=stats&action=tokensupply&contractaddress=${contractaddress}&apikey=${apiPath[network].api_key}`
  );
};

const _fetch = async (contractaddress, network, name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await retry(
        async (bail) => await getTokenSupply(contractaddress, network)
      );
      let result = {};
      result[name] = new BigNumber(response.data.result).div(10 ** 18);
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

const getNetworkAssets = async (network) => {
  const promises = [];
  const allAddress = Object.keys(assets[network]);
  allAddress.forEach((item, i) => {
    promises.push(
      new Promise((res) => setTimeout(res, 1000 * i)).then(() =>
        _fetch(item, network, assets[network][item])
      )
    );
  });
  try {
    return await Promise.all(promises);
  } catch (e) {
    console.log(e);
  }
};

const _ethFetch = async () => {
  try {
    const result = await getNetworkAssets("eth");
    const object = Object.assign({}, ...result);
    return object;
  } catch (e) {
    console.log(e);
  }
};

const _bscFetch = async () => {
  try {
    const result = await getNetworkAssets("bsc");
    const object = Object.assign({}, ...result);
    return object;
  } catch (e) {
    console.log(e);
  }
};

const _maticFetch = async () => {
  try {
    const result = await getNetworkAssets("matic");
    console.log(result);
    const object = Object.assign({}, ...result);
    return object;
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  methodology:
    "TVL is calculated based on the total KFT in circulation along with every k-assset minted on other chains against native assets deposited.",
  ethereum: {
    tvl: _ethFetch,
  },
  bsc: {
    tvl: _bscFetch,
  },
  polygon: {
    tvl: _maticFetch,
  },
};
