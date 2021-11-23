const sdk = require("@defillama/sdk");
const { transformArbitrumAddress, transformPolygonAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require('../helper/masterchef');
const IOTEX_CG_MAPPING = require("./iotex_coingecko_mapping.json")
const STAKING_CONTRACT_ARBITRUM = "0x1cCf20F4eE3EFD291267c07268BEcbFDFd192311"; //MASTERCHEF ARBITRUM
const STAKING_CONTRACT_IOTEX = "0x83E7e97C4e92D56c0653f92d9b0c0B70288119b8";  // MASTERCHEF IOTEX
const STAKING_CONTRACT_POLYGON = "0x34E4cd20F3a4FdC5e42FdB295e5A118D4eEB0b79";  // MASTERCHEF POLYGON


function compareAddresses(a, b){
    return a.toLowerCase() === b.toLowerCase()
}

async function transformIotexAddress() {
    return (addr) => {
        const dstToken = Object.keys(IOTEX_CG_MAPPING).find(token => compareAddresses(addr, token))
        if (dstToken !== undefined) {
            return IOTEX_CG_MAPPING[dstToken].contract || IOTEX_CG_MAPPING[dstToken].coingeckoId
        }
        return `iotex:${addr}`; 
    }
}

function fixIotexBalances(balances){
    for(const representation of ['zoomswap', 'metanyx', 'imagictoken', 'parrot-egg']){
        if(balances[representation] !== undefined){
            balances[representation] = Number(balances[representation])/1e18
        }
    }
}

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformArbitrumAddress();

  await addFundsInMasterChef(
      balances, STAKING_CONTRACT_ARBITRUM, chainBlocks.arbitrum, 'arbitrum', transformAddress);
  delete balances['0x78055daa07035aa5ebc3e5139c281ce6312e1b22'];  //TOKEN ADDRESS
  delete balances['0x78055dAA07035Aa5EBC3e5139C281Ce6312E1b22']; //TOKEN ADDRESS

  return balances;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformPolygonAddress();

  await addFundsInMasterChef(
      balances, STAKING_CONTRACT_POLYGON, chainBlocks.polygon, 'polygon', transformAddress);
  delete balances['0xb63e54f16600b356f6d62ddd43fca5b43d7c66fd'];  //TOKEN ADDRESS
  delete balances['0xB63E54F16600b356f6d62dDd43Fca5b43d7c66fd']; //TOKEN ADDRESS

  return balances;
};


const iotexTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const transformAddress = await transformIotexAddress();
    
    await addFundsInMasterChef(
        balances, STAKING_CONTRACT_IOTEX, chainBlocks.iotex, 'iotex', transformAddress);

    fixIotexBalances(balances);

    return balances;
};

module.exports={
    arbitrum: {
        tvl: arbitrumTvl
    },
    iotex: {
        tvl: iotexTvl
    },
    polygon: {
        tvl: polygonTvl
    },
    tvl: sdk.util.sumChainTvls([arbitrumTvl, iotexTvl, polygonTvl]),
}
