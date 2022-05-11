const web3 = require('../../web3.js');

const UniswapV2PairContractAbi = require('../../../helper/ankr/abis/UniswapV2Pair.json');
const ERC20Abi = require('../../../helper/ankr/abis/ERC20.json');

const rawFarms = [
  {//0
    pid: 4,
    title: 'onxEthLp',
    address: '0x62f22A47e5D2F8b71cC44fD85863753618312f67',
    abi: UniswapV2PairContractAbi,
    isLpToken: true,
    subTokenSymbol1: 'ONX',
    subTokenSymbol2: 'WETH',
    subTokenAddresses1: '0xe0ad1806fd3e7edf6ff52fdb822432e847411033',
    subTokenAddresses2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  {//1
    pid: 1,
    title: 'aETHc',
    address: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
    abi: ERC20Abi,
    isLpToken: false,
    subTokenSymbol1: 'aETHc',
    subTokenSymbol2: 'aETHc',
    subTokenAddresses1: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
    subTokenAddresses2: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
  },
  {//2
    pid: 0,
    title: 'ANKR',
    address: '0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4',
    abi: ERC20Abi,
    isLpToken: false,
    subTokenSymbol1: 'ANKR',
    subTokenSymbol2: 'ANKR',
    subTokenAddresses1: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
    subTokenAddresses2: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  },
  {//3
    title: 'onxEthSlpMulti',
    address: '0x0652687E87a4b8b5370b05bc298Ff00d205D9B5f',
    abi: UniswapV2PairContractAbi,
    isLpToken: true,
    subTokenSymbol1: 'ONX',
    subTokenSymbol2: 'WETH',
    subTokenAddresses1: '0xe0ad1806fd3e7edf6ff52fdb822432e847411033',
    subTokenAddresses2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    isCustomFarmContract: true,
  },
  {//4
    pid: 7,
    title: 'xSushi',
    address: '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
    abi: ERC20Abi,
    isLpToken: false,
    subTokenSymbol1: 'xSushi',
    subTokenSymbol2: 'xSushi',
    subTokenAddresses1: '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
    subTokenAddresses2: '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
  },
  {//5
    pid: 8,
    title: 'BOND',
    address: '0x0391d2021f89dc339f60fff84546ea23e337750f',
    abi: ERC20Abi,
    isLpToken: false,
    subTokenSymbol1: 'BOND',
    subTokenSymbol2: 'BOND',
    subTokenAddresses1: '0x0391d2021f89dc339f60fff84546ea23e337750f',
    subTokenAddresses2: '0x0391d2021f89dc339f60fff84546ea23e337750f',
  },
  {//6
    pid: 6,
    title: 'onxEthSlp',
    address: '0x0652687E87a4b8b5370b05bc298Ff00d205D9B5f',
    abi: UniswapV2PairContractAbi,
    isLpToken: true,
    subTokenSymbol1: 'ONX',
    subTokenSymbol2: 'WETH',
    subTokenAddresses1: '0xe0ad1806fd3e7edf6ff52fdb822432e847411033',
    subTokenAddresses2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
];

const enrichFarms = () => {
  return rawFarms.map(farm => {
    const contract = new web3.eth.Contract(farm.abi, farm.address);
    return { ...farm, contract }
  })
}

const farms = enrichFarms();

module.exports = {
  farms,
}