const axios = require("axios");
const web3 = require('web3');
const { ethers } = require('ethers');
const CONST = require("./constants");

exports.getLPTokensDetails = async (token0, token1, poolPrice, network) => {
    let token0Details = await this.getTokenPrice(token0, network);
    let token1Details = await this.getTokenPrice(token1, network);
    if(!token0Details.price) {
        try {
            token0Details.price = await getPriceFromUniswapForToken0(token1Details.price, poolPrice);
        } catch(err) {
            console.error(`err retrieving uniswap price: ${err.message}`);
            token0Details.price = 0;
        }
    }
    if(!token1Details.price) {
        try {
            token1Details.price = await getPriceFromUniswapForToken1(token0Details.price, poolPrice);
        } catch(err) {
            console.error(`err retrieving uniswap price: ${err.message}`);
            token1Details.price = 0;
        }
    }
    return [token0Details, token1Details];
}


exports.getTokenPrice = async (token, network) => {
    token.address = await this.checksumAddress(token.address);
    if(!CONST.networks[network]) {
        errorLogger.error(`network is missing: ${network}`);
        return {
            address: token.address
        }
    }
    let path = `${CONST.COINGECKO_API_URL}/${CONST.networks[network]}/contract/${token.address.toLowerCase()}`;
    let res;
    try {
        res = await axios.get(path);
    } catch(err) {
        let status = err.response.status;
        if(status != 404) {
            errorLogger.error(`error retrieving token data for: ${network} ${token.address}: ${err.message}, ${err.response.data.error}`);
        }
        res = {data: {}};
    }
    let data = res.data;
    let marketPrice;
    if(!data.market_data) {
        marketPrice = 0;
    } else {
        marketPrice = data.market_data.current_price.usd;
    }
    token.price = marketPrice;
    return token;
}

async function getPriceFromUniswapForToken0(token1Price, poolPrice) {
    let poolPriceBn = await ethers.BigNumber.from(poolPrice);
    let token1PriceBn = await ethers.BigNumber.from((token1Price * 1e8).toFixed(0));
    let dividerBn = await ethers.BigNumber.from(10);
    let token0PriceInUSD = poolPriceBn.mul(token1PriceBn).div(dividerBn.pow(8)) / 1e12;
    return token0PriceInUSD;
}

async function getPriceFromUniswapForToken1(token0Price, poolPrice) {
    let token1PriceInUSD = await this.bn((token0Price * 1e8).toFixed(0)).mul(1e4).div(poolPrice).toNumber();
    return token1PriceInUSD;
}

exports.checksumAddress = async (address) => {
  return web3.utils.toChecksumAddress(address);
}

exports.bn = async (amount) => {
  return ethers.BigNumber.from(amount);
}
