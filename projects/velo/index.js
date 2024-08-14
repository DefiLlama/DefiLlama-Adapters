const { ethers } = require('ethers');
const axios = require('axios');
const { default: BigNumber } = require('bignumber.js');

const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');

const contractABI = [
  {
    "inputs": [],
    "name": "rewardToken",
    "outputs": [{ "internalType": "contract ERC20", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalStaked",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "evrySupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      {
        "internalType": "uint112",
        "name": "_reserve0",
        "type": "uint112"
      },
      {
        "internalType": "uint112",
        "name": "_reserve1",
        "type": "uint112"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token0",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token1",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Define the contract addresses
const AprFixLockedAddresses = [
  "0x5e10B2247a430f97c94205894B9185F687A32345",
  "0x13c5C83cf9B9aC68FA18272B756Bce1635196132",
  "0x022af5ce19720a938Ba8C9E66FdF1Da1606298eF",
  "0x37cCcC19acAB91E8bC6074Cb4EaaFef1185ee1Bb",
  "0x051bB49EdB865Bb4cC9277BbB132C922403B07e4",
  "0x2703E5D3709782e85957E40a9c834AFD4D45caF9",
  "0x5935DC3250a0d8a0aC7c2e4AB925C4FEf2F8FDf8",
  "0x59098E3c6C5Bcbecb4117C6eF59b341d1F0F3083",
  "0xDa000FA80C5E9cb4E24a66bFF6a56cC454422e78",
  "0xEfA6EAbcb5fa35827DDB236046B3DDB6d257022B",
  "0xc12A93bf62CfD50620BCfDDD903913903DF647B4",
  "0xc322a2110958c1365e88D88aef65Ebdf335b6E67"
];

const AprFixLockWithChangeableRatioTvl = [
    "0xEF03B465A6D7baDF8727819104d29F0405d1Ce65"
]

const CurrentFarmAddresses = {
  "0x6deee602e2ccb71e69dc2764efbd5bf9314effde": {
      lpType: true,
      pair_id: "VELO_USDV"
  },
  "0x8d5B39B8EBAC7f3404AF73688f352b05C835cEEA": {
      lpType: true,
      pair_id: "USDT_BUSD"
  },
  "0x71b33c74bd2a630b63af9a235740aa54fe51a10b": {
      lpType: true,
      pair_id: "VELO_BNB"
  },
  "0x5930a391D1ca11369AFde6eA4D80448106Cb4A5C": {
      lpType: true,
      pair_id: "KSW_USDT"
  },
  "0x526357ef8304ce6cd46689aa0f9abf642a40b802": {
      lpType: true,
      pair_id: "BNB_BUSD"
  },
  "0xf486ad071f3bee968384d2e39e2d8af0fcf6fd46": {
      lpType: false,
      stakingSymbol: "VELO_TOKEN"
  }
}

const OldFarmAddresses = {
  "0x3c8EC1728C080f76dc83baA5d51A0cC367B4A35F": {
      lpType: false,
      stakingSymbol: "VELO_DEPRECATED_TOKEN"
  },
  "0xf486ad071f3bee968384d2e39e2d8af0fcf6fd46": {
      lpType: false,
      stakingSymbol: 'VELO_TOKEN'
  },
  "0xC2d4A3709e076A7A3487816362994a78ddaeabB6": {
      lpType: false,
      stakingSymbol: 'EVRY_TOKEN',
      pair_id: "EVRY_TOKEN"
  },
  "0x8d5B39B8EBAC7f3404AF73688f352b05C835cEEA": {
      lpType: true,
      pair_id: "USDT_BUSD"
  },
  "0x5930a391D1ca11369AFde6eA4D80448106Cb4A5C": {
      lpType: true,
      pair_id: "KSW_USDT"
  },
  "0x526357ef8304ce6cd46689aa0f9abf642a40b802": {
      lpType: true,
      pair_id: "BNB_BUSD"
  },
  "0xF20aDd7CD1beaAf0CC6Ddd0EbE29060E5e20afFA": {
      lpType: true,
      pair_id: "BNB_XLM"
  },
  "0xfcd4bbdc95da7b749adab99133a846e9cc4226b8": {
      lpType: true,
      pair_id: "EVRY_BNB"
  },
}

const TokenConfigs = {
  "BNB_TOKEN": {
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    code: "BNB_TOKEN",
    name: "BNB",
    priceRoute: ["BUSD"],
    symbol: "BNB",
  },
  "BUSD_TOKEN": {
    address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    code: "BUSD_TOKEN",
    name: "BUSD",
    priceRoute: [],
    symbol: "BUSD",
  },
  "EVRY_TOKEN": {
    address: "0xC2d4A3709e076A7A3487816362994a78ddaeabB6",
    code: "EVRY_TOKEN",
    name: "EVRY",
    priceRoute: ["BNB", "BUSD"],
    symbol: "EVRY",
  },
  "KSW_TOKEN": {
    address: "0x270178366a592bA598C2e9d2971DA65f7bAa7C86",
    code: "KSW_TOKEN",
    name: "KSW",
    priceRoute: ["USDT"],
    symbol: "KSW",
  },
  "USDT_TOKEN": {
    address: "0x55d398326f99059ff775485246999027b3197955",
    code: "USDT_TOKEN",
    name: "USDT",
    priceRoute: ["BUSD"],
    symbol: "USDT",
  },
  "USDV_TOKEN": {
    address: "0x80458df7142ab707346020a180c44d02271c64be",
    code: "USDV_TOKEN",
    name: "O-USDV",
    priceRoute: ["USDV"],
    symbol: "USDV",
  },
  "VELO_DEPRECATED_TOKEN": {
    address: "0x3c8EC1728C080f76dc83baA5d51A0cC367B4A35F",
    code: "VELO_DEPRECATED_TOKEN",
    decimals: 13,
    externalPrice: true,
    name: "VELO",
    priceRoute: [],
    slug: "velo",
    symbol: "VELO_DEPRECATED",
  },
  "VELO_TOKEN": {
    address: "0xf486ad071f3bee968384d2e39e2d8af0fcf6fd46",
    code: "VELO_TOKEN",
    externalPrice: true,
    name: "VELO",
    priceRoute: [],
    slug: "velo",
    symbol: "VELO",
  },
  "XLM_TOKEN": {
    address: "0x43c934a845205f0b514417d757d7235b8f53f1b9",
    code: "XLM_TOKEN",
    name: "XLM",
    priceRoute: ["BNB", "BUSD"],
    symbol: "XLM",
  },
};

const OldFarmContractAddress = "0x33472144Eaa7540E7badA5a1ab7Da372e48a9252"
const CurrentFarmContractAddress = "0xDD3e2da1d017A564b8225bc8e92f2970cfa61945"

const deciaml = 18;
const coingeckoAPI = 'https://api.coingecko.com/api/v3/coins/'

async function getTokenPrice(tokenId) {
    if (tokenId === 'usdv') {
        return 1;
    }
    else {
        const url = `${coingeckoAPI}${tokenId}`;
        try {
            const response = await axios.get(url);
            let price = response.data.market_data.current_price.usd;
            price = BigNumber(price);
            return price;
        } catch (error) {
            console.error('Error fetching token price:', error);
            return 0;
        }
    }
}


async function getTotalStaked(contractAddress) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const totalStaked = await contract.totalStaked();
  return totalStaked;
}

async function getTotalSupply(contractAddress) {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    try {
        const totalSupply = BigNumber(await contract.totalSupply());
        return totalSupply;
    } catch (error) {
        return BigNumber(0);
    }
}

async function getContractReserves(contractAddress) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const reserves = await contract.getReserves();
  const reserve0 = BigNumber(reserves._reserve0.toString());
  const reserve1 = BigNumber(reserves._reserve1.toString());
  return {
      reserve0: reserve0,
      reserve1: reserve1
  }
}

async function GetAprFixLockedTvl() {
    let tvl = BigNumber(0);
    for (let i = 0; i < AprFixLockedAddresses.length; i++) {
        const totalStaked = BigNumber(await getTotalStaked(AprFixLockedAddresses[i]));
        if (totalStaked) {
            tvl = tvl.plus(totalStaked);
        }8
    }
    let tokenPrice = await getTokenPrice('velo')
    tvl = tvl.dividedBy(BigNumber(10).pow(deciaml))
    tvl = tvl.multipliedBy(tokenPrice)
    return tvl;
}

async function GetAprFixLockWithChangeableRatioTvl() {
    let tvl = BigNumber(0);
    for (let i = 0; i < AprFixLockWithChangeableRatioTvl.length; i++) {
        const totalStaked = BigNumber(await getTotalStaked(AprFixLockWithChangeableRatioTvl[i]));
        if (totalStaked) {
            tvl = tvl.plus(totalStaked);
        }
    }
    let tokenPrice = await getTokenPrice('usdv')
    tvl = tvl.dividedBy(BigNumber(10).pow(deciaml))
    tvl = tvl.multipliedBy(tokenPrice)
    return tvl;
}

function findTokenNameByAddress(address, tokens) {
  for (let tokenId in tokens) {
    if (tokens[tokenId].address.toLowerCase() == address.toLowerCase()) {
      return tokenId
    }
  }
  return undefined;
}

function getReserveByPairCode(mapIDofReserves, symbol1, symbol2) {
  return (
    mapIDofReserves[`${symbol1}_${symbol2}`] ||
    mapIDofReserves[`${symbol2}_${symbol1}`]
  )
}

async function calculateTokenPrice(tokens, mapIdOfReserves){
  let tokenPriceDict = {}
  for (let tokenId in tokens) {
    const token = tokens[tokenId];
    let targetCode = token.symbol;
    let targetPrice = 1;
    if (token.externalPrice) {
      targetPrice = await getTokenPrice(token.slug);
    } else if (token.fixedPrice) {
      targetPrice = token.fixedPrice;
    } else {
      for (let i = 0; i < token.priceRoute.length; i++) {
        const route = token.priceRoute[i];
        const reserve = getReserveByPairCode(mapIdOfReserves, targetCode, route);
        if (reserve === undefined) {
          targetCode = route;
          targetPrice = 0;
          continue;
        }
        const ratio = reserve.ratios[route + "_TOKEN"];
        targetCode = route;
        targetPrice = targetPrice * ratio;
      }
    }
    tokenPriceDict[tokenId] = targetPrice;
  }
  return tokenPriceDict;
}

async function getMapIdOfReserves(pairs, tokens) {
  let mapIdOfReserves = {}
  for (const contractAddress in pairs) {
    const pair_info = pairs[contractAddress];
    if (pair_info.lpType) {
      let contract = new ethers.Contract(contractAddress, contractABI, provider);
      const reserve = await getContractReserves(contractAddress);
      const reserve0 = reserve.reserve0;
      const reserve1 = reserve.reserve1;
      const token0 = String(await contract.token0());
      const token0Name = findTokenNameByAddress(token0, tokens);
      const token1 = String(await contract.token1());
      const token1Name = findTokenNameByAddress(token1, tokens);
      let ratios = {}
      let reserves = {}
      ratios[token0Name] = reserve0.dividedBy(reserve1);
      ratios[token1Name] = reserve1.dividedBy(reserve0);
      reserves[token0Name] = reserve0;
      reserves[token1Name] = reserve1;
      mapIdOfReserves[pair_info.pair_id] = {
        ratios: ratios,
        reserves: reserves,
        token0: token0Name,
        token1: token1Name,
      }
    }
  }
  return mapIdOfReserves;
}

async function GetOldFarmTvl() {
    let tvl = BigNumber(0);
    const mapIdOfReserves = await getMapIdOfReserves(OldFarmAddresses, TokenConfigs);
    const tokenPriceDict = await calculateTokenPrice(TokenConfigs, mapIdOfReserves);
    for (const contractAddress in OldFarmAddresses) {
        const value = OldFarmAddresses[contractAddress];
        let totalStaked = BigNumber(0);
        let lpPerUsd = BigNumber(0);
        if (value.pair_id === "EVRY_TOKEN") {
            const contract = new ethers.Contract(OldFarmContractAddress, contractABI, provider);
            totalStaked = BigNumber(await contract.evrySupply());
        } else {
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            totalStaked = BigNumber(await contract.balanceOf(OldFarmContractAddress));
        }
        totalStaked = totalStaked.dividedBy(BigNumber(10).pow(deciaml));

        const reservePair = mapIdOfReserves[value.pair_id];
        if (!value.lpType) {
            lpPerUsd = tokenPriceDict[value.stakingSymbol]
            let decimal = TokenConfigs[value.stakingSymbol].decimals;
            if (decimal) {
              lpPerUsd = lpPerUsd.multipliedBy(BigNumber(10).pow(decimal));
            }
        } else {
            if (totalStaked.isGreaterThan(0)) {
                const totalSupply = await getTotalSupply(contractAddress);
                const reserveTotalUsd0 = reservePair.reserves[reservePair.token0].multipliedBy(tokenPriceDict[reservePair.token0]);
                const reserveTotalUsd1 = reservePair.reserves[reservePair.token1].multipliedBy(tokenPriceDict[reservePair.token1]);
                const reserveTotalUsd = reserveTotalUsd0.plus(reserveTotalUsd1);
                lpPerUsd = reserveTotalUsd.dividedBy(totalSupply);
            } else {
                lpPerUsd = BigNumber(0);
            }
        }
        const tmpTvl = totalStaked.multipliedBy(lpPerUsd);
        tvl = tvl.plus(tmpTvl);
    }
    return tvl;
}

async function GetCurrentFarmTvl() {
  let tvl = BigNumber(0);
  const mapIdOfReserves = await getMapIdOfReserves(CurrentFarmAddresses, TokenConfigs);
  const tokenPriceDict = await calculateTokenPrice(TokenConfigs, mapIdOfReserves);
  for (const contractAddress in CurrentFarmAddresses) {
      const value = CurrentFarmAddresses[contractAddress];
      let totalStaked = BigNumber(0);
      let lpPerUsd = BigNumber(0);
      if (value.pair_id === "EVRY_TOKEN") {
          const contract = new ethers.Contract(CurrentFarmContractAddress, contractABI, provider);
          totalStaked = BigNumber(await contract.rewardTokenSupply());
      } else {
          const contract = new ethers.Contract(contractAddress, contractABI, provider);
          totalStaked = BigNumber(await contract.balanceOf(CurrentFarmContractAddress));
      }
      totalStaked = totalStaked.dividedBy(BigNumber(10).pow(deciaml));

      const reservePair = mapIdOfReserves[value.pair_id];
      if (!value.lpType) {
          lpPerUsd = tokenPriceDict[value.stakingSymbol]
          let decimal = TokenConfigs[value.stakingSymbol].decimals;
          if (decimal) {
            lpPerUsd = lpPerUsd.multipliedBy(BigNumber(10).pow(decimal));
          }
      } else {
          if (totalStaked.isGreaterThan(0)) {
              const totalSupply = await getTotalSupply(contractAddress);
              const reserveTotalUsd0 = reservePair.reserves[reservePair.token0].multipliedBy(tokenPriceDict[reservePair.token0]);
              const reserveTotalUsd1 = reservePair.reserves[reservePair.token1].multipliedBy(tokenPriceDict[reservePair.token1]);
              const reserveTotalUsd = reserveTotalUsd0.plus(reserveTotalUsd1);
              lpPerUsd = reserveTotalUsd.dividedBy(totalSupply);
          } else {
              lpPerUsd = BigNumber(0);
          }
      }
      const tmpTvl = totalStaked.multipliedBy(lpPerUsd);
      tvl = tvl.plus(tmpTvl);
  }
  return tvl;
}

async function tvl() {
    const aprFixLockedTvl = await GetAprFixLockedTvl();
    const aprFixLockWithChangeableRatioTvl = await GetAprFixLockWithChangeableRatioTvl();
    const oldFarmTvl = await GetOldFarmTvl();
    const currentFarmTvl = await GetCurrentFarmTvl();
    let totalTvl = aprFixLockedTvl.plus(aprFixLockWithChangeableRatioTvl).plus(oldFarmTvl).plus(currentFarmTvl);
    return {
      'usd': totalTvl.toString()
    }
}

module.exports = {
  methodology: 'Sums the total value locked of all farms and locked pools in Velo Finance.',
  bsc: {
    tvl: tvl
  },
};
