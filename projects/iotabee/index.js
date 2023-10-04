const { get } = require("axios");
const BigNumber = require("bignumber.js");

const WHITELIST = [
  '0x36f10f51A9F7fA91CFfe6e0ac2E5A987A1841F19', // sETH - SMR
  '0x4e3817E85875046FBDF1D2BF620307607823BFAC', // sBTC - SMR,
  '0x280D2805fb41Be5a9aB3D152450460365582B321', // sBTC - sSOON
  '0x80db478e9d4F943382d5B6e5464ed942841BfA6f', // sSOON - sETH
  '0x2D9733F6fb06E226A6985FEFa9665f956c600f3B', // sSOON - SMR
];
const SMR = '0x6C890075406C5DF08b427609E3A2eAD1851AD68D'.toLowerCase();
const sSOON = '0x3C844FB5AD27A078d945dDDA8076A4084A76E513'.toLowerCase();
const sETH = '0xa158a39d00c79019a01a6e86c56e96c461334eb0'.toLowerCase();
const sBTC = '0x1cdf3f46dbf8cf099d218cf96a769cea82f75316'.toLowerCase();

const _getAllPoolsOverview = async () => {
  const { data, status } = await get('https://dex.iotabee.com/v3/pools/overview');
  if (status === 200) {
    // console.log(data);
    return data
      .filter((pool) => WHITELIST.indexOf(pool.contract) >= 0)
      .map((pool) => {
        return {
          [pool.token0]: pool.reserve0,
          [pool.token1]: pool.reserve1
        }
      });
  }
}

BigNumber.config({ EXPONENTIAL_AT: 100 });

const tvl = async (timestamp, ethBlock, chainBlocks, { api }) => {
  const balances = {};
  const allPoolsOverview = await _getAllPoolsOverview();
  allPoolsOverview.forEach((pool) => {
    Object.entries(pool).forEach(([token, balance]) => {
      switch (token.toLowerCase()) {
        case SMR: {
          token = 'shimmer';
          balance = new BigNumber(balance).div(new BigNumber(10).pow(18)).toString();
          break;
        }
        case sSOON: {
          token = 'soonaverse';
          balance = new BigNumber(balance).div(new BigNumber(10).pow(6)).toString();
          break;
        }
        case sETH: {
          token = 'ethereum';
          balance = new BigNumber(balance).div(new BigNumber(10).pow(18)).toString();
          break;
        }
        case sBTC: {
          token = 'bitcoin';
          balance = new BigNumber(balance).div(new BigNumber(10).pow(8)).toString();
          break;
        }
        default: token = `shimmer_evm:${token}`
      }
      if (balances[token]) {
        balances[token] = new BigNumber(balances[token]).plus(new BigNumber(balance)).toString();
      } else {
        balances[token] = balance;
      }
    });
  });
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  shimmer_evm: {
    tvl
  }
}
