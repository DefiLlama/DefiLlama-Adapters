const sdk = require("@defillama/sdk");
//Helper
const erc20Abi = require("../helper/abis/erc20.json");
const { getCache } = require("../helper/http");
//Contracts
const contracts = require("./contracts.json");

//Cache
const decimalsCache = {};

class Vault {
    constructor(name, address, token) {
        this.name = name;
        this.address = address;
        this.token = token;
    }

    async totalSupply(chain) {
        const response = await sdk.api.abi.call({
            abi: erc20Abi.totalSupply,
            target: this.address,
            chain,
        });
        return response.output;
    }

    async pricePerShare(chain) {
        const abi = "function getPricePerFullShare() public view returns (uint256)";
        const response = await sdk.api.abi.call({
            abi: abi,
            target: this.address,
            chain,
        });
        return response.output;
    }
}

class PriceFetcher {
    static async tokenPrice(chain, tokenAddress) {
        const url = `https://coins.llama.fi/prices/current/${chain}:${tokenAddress}`;
        try {
            const data = await getCache(url);
            return data.coins[`${chain}:${tokenAddress}`]?.price || 0;
        } catch (error) {
            console.error('Error fetching token price:', error);
            return 0;
        }
    }
}

class Chain {
    constructor(chainName) {
        this.chainName = chainName;
    }

    async calculateTVL() {
        const balances = {};
        if (!contracts[this.chainName]) return balances;

        for (const { name, address, token } of contracts[this.chainName].vaults) {
            const vault = new Vault(name, address, token);
            const supply = await vault.totalSupply(this.chainName);
            const pricePerShare = await vault.pricePerShare(this.chainName);
            const decimals = await this.tokenDecimals(token);

            const tvl = this.tvlCalc(supply, pricePerShare, decimals);
            const tokenUSDPrice = await PriceFetcher.tokenPrice(this.chainName, token);

            balances[token] = Number(tvl) * tokenUSDPrice;
        }
        return balances;
    }

    async tokenDecimals(tokenAddress) {
        tokenAddress = tokenAddress.toLowerCase();
        const key = `${this.chainName}-${tokenAddress}`;
        if (!decimalsCache[key]) {
            const { output: decimals } = await sdk.api.erc20.decimals(tokenAddress, this.chainName);
            decimalsCache[key] = decimals;
        }
        return decimalsCache[key];
    }

    tvlCalc(supply, sharePrice, decimals) {
        return (BigInt(supply) * BigInt(sharePrice)) / BigInt(10 ** decimals);
    }
}

const supportedChains = ["ethereum"];
const chainInstances = supportedChains.reduce((instances, chainName) => {
    instances[chainName] = new Chain(chainName);
    return instances;
}, {});

const chainTypeExports = Object.fromEntries(
    Object.entries(chainInstances).map(([chainName, chainInstance]) => [
        chainName,
        { tvl: () => chainInstance.calculateTVL() }
    ])
);

module.exports = chainTypeExports;
