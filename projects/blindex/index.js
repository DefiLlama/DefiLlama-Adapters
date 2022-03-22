const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/blindex.json");
const { calculateUniTvl } = require("../helper/calculateUniTvl.js");
const { formatAddressChecksum } = require("../helper/formatAddressChecksum.js");
const { getBlock } = require('../helper/getBlock');
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');

const chains = {
  rsk: {
    uniswapFactoryAddress: "0x5Af7cba7CDfE30664ab6E06D8D2210915Ef73c2E",
    bdxTokenAddress: "0x6542a10E68cEAc1Fa0641ec0D799a7492795AAC1",
    // If a token doesn't exist on CoinGecko, map it to another token that's equal to it / wrappes it
    coingeckoMapping: {
      prefix: "rsk",
      "0x542fda317318ebf1d3deaf76e0b632741a7e677d": "rootstock", // RSK's WRBTC
      "0x1d931bf8656d795e50ef6d639562c5bd8ac2b78f": "ethereum", // RSK's ETHs
      "0xb450ff06d950efa9a9c0ad63790c51971c1be885": "usd-coin", // RSK's BDUS
      "0x99ac494badd0cba26143bd423e39a088591c7b09": "tether-eurt", // RSK's BDEU
      "0xb5999795be0ebb5bab23144aa5fd6a02d080299f": "usd-coin", // RSK's XUSD
    },
  },
};

function mapCoingeckoAddress(chainName, address) {
  let mappedName =
    chains[chainName].coingeckoMapping[address] ||
    chains[chainName].coingeckoMapping[address.toLowerCase()];

  if (!mappedName) {
    const addressPrefix =
      chainName === "ethereum"
        ? ""
        : `${chains[chainName].coingeckoMapping["prefix"]}:`;
    mappedName = `${addressPrefix}${formatAddressChecksum(address, chainName)}`;
  }

  return mappedName;
}

const transforms = {
  "0x542fda317318ebf1d3deaf76e0b632741a7e677d": "0x8daebade922df735c38c80c7ebd708af50815faa", // RSK's WRBTC
  "0x1d931bf8656d795e50ef6d639562c5bd8ac2b78f": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // RSK's ETHs
}

const collatVaults = [
  "0xb40ba8b40cab1c1b502071e53ce476ed488a94a8",
  "0x638b112b09dd60bddbb94a3a7b5e64e15ef91b2e",
  "0x49dc93f18e47981abce48e721f8ff6d0be922fa9",
  "0x5c122f0e5cc38a92548c9632bbddb336ec019a63"
  ];
  
  const tokenOfVaults = [
    ["0x542fda317318ebf1d3deaf76e0b632741a7e677d", false],
    ["0x1d931bf8656d795e50ef6d639562c5bd8ac2b78f", false]
  ]

async function collaterlTvl(timestamp, ethblock, chainBlocks) {
  const block = await getBlock(timestamp, "rsk", chainBlocks);
  let balances = {};

  await sumTokensAndLPsSharedOwners(
    balances, 
    tokenOfVaults, 
    collatVaults, 
    block, 
    "rsk",
    (addr) => {return transforms[addr.toLowerCase()] ?? `rsk:${addr}`}
    );
    
  return balances;

}

const uniswapFactoryAddress = "0x5Af7cba7CDfE30664ab6E06D8D2210915Ef73c2E";
const chainName = "rsk";
async function uniswapV2Tvl(timestamp, ethblock, chainBlocks) {
  const block = await getBlock(timestamp, "rsk", chainBlocks);
  const rawBalances = await calculateUniTvl(
    (address) => formatAddressChecksum(address, chainName),
    block,
    chainName,
    uniswapFactoryAddress,
    undefined,
    true,
  );

  const tokensAddresses = Object.keys(rawBalances);
  const balances = {};

  for (let index = 0; index < tokensAddresses.length; index++) {
    const currentToken = tokensAddresses[index];
    const decimals = (
      await sdk.api.erc20.decimals(
        formatAddressChecksum(currentToken, chainName),
        chainName
      )
    ).output;

    const mappedAddress = mapCoingeckoAddress(chainName, currentToken);
    if (!balances[mappedAddress]) {
      balances[mappedAddress] = 0;
    }

    balances[mappedAddress] += rawBalances[currentToken] / 10 ** decimals;
  }

  return balances;
}




module.exports = {
  misrepresentedTokens: true,
  methodology:
    "(1) AMM LP pairs - All the liquidity pools from the Factory address are used to find the LP pairs. (2) Collateral - All the collateral being used to support the stable coins - Bitcoin, Ethereum & BDX",
  rsk: {
    tvl: sdk.util.sumChainTvls([uniswapV2Tvl,collaterlTvl]),
  },
  
};
