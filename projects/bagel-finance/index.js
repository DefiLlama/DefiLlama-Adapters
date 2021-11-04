const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs")

const bankAddress = "0x18C32E273D0F13D5b8268B3Bc5acD30f26A8F91a";
const tokens = ["0x55d398326f99059ff775485246999027b3197955",
                "0xe9e7cea3dedca5984780bafc599bd69add087d56",
                "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
                "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
                "0x9c65ab58d8d978db963e63f2bfb7121627e3a739",
                "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
                "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"]

const lps = [{"0":"0x35e716c5D1038D41BdbA201413dBa9FDF16BBede","1":"0x0eD7e52944161450477ee417DE9Cd3a859b14fD0"},
             {"0":"0x9583a15ED9766634d5b947F9837fB9156e80Cc55","1":"0x58f876857a02d6762e0101bb5c46a8c1ed44dc16"},
             {"0":"0x78ab47680dF11a14509eEB46D07A5296161102dd","1":"0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae"},
             {"0":"0x62B21315F17A0929DC76F888256bd66F774fc8E8","1":"0xf45cd219aef8618a92baa7ad848364a158a24f33"},
             {"0":"0x13C7551604CD533f19fd8AC07c4f02eF7F749036","1":"0x804678fa97d91b974ec2af3c843270886528a9e6"},
             {"0":"0x30e3624584441ed9c2552265743bA2e02cAe7714","1":"0xea26b78255df2bbc31c1ebf60010d78670185bd0"},
             {"0":"0x4eBf4522046c5D1AAB5881C5c8A1679ba41c71B7","1":"0x61eb789d75a95caa3ff50ed7e47b96c132fec082"},
             {"0":"0x69C8e18fEBE99Eb32EBde5b0Bf4970066C9C0fEc","1":"0xe1cbe92b5375ee6afe1b22b555d257b4357f6c68"},
             {"0":"0x56d382C3f62E00e0D4eeAA283212f557C82D2Ab4","1":"0xda28eb7aba389c1ea226a420bce04cb565aafb85"},
             {"0":"0x09e44Da2975C119B42fA990d24dA5B16B6e37962","1":"0x09cb618bf5ef305fadfd2c8fc0c26eecf8c6d5fd"},
             {"0":"0x1Cb542509BbBba65ab4a1509bd59fc9f7195a9CA","1":"0x0fb881c078434b1c0e4d0b64d8c64d12078b7ce2"},
             {"0":"0x63cA00DEfc958af2a8a14923978F79CAd1268fE4","1":"0x340192d37d95fb609874b1db6145ed26d1e47744"},
             {"0":"0xA37255b10b1757aA1c6009A3089F50b654f5a093","1":"0xaf9aa53146c5752bf6068a84b970e9fbb22a87bc"},
             {"0":"0xBd245975DB5D4255E5E6c4531DffE5A6829db985","1":"0xba68d6bee4f433630dee22c248a236c8f6eae246"},
             {"0":"0xe4aD6C2Cd37DEd0560f766327dD426e04B0Fa657","1":"0x1c0276642f2a7cbcf6624d511f34811cdc65212c"},
             {"0":"0x3b402F7448edC7c7a959B336367a06aDDe9Ca07B","1":"0x223740a259e461abee12d84a9fff5da69ff071dd"},
             {"0":"0xdf7039684F943E82a8738A340830e4D8068F1f7D","1":"0x969f2556F786a576F32AeF6c1D6618f0221Ec70e"},
             {"0":"0x514b825ebb062EB29681C281092f27eFeC838Ceb","1":"0x82E8F9e7624fA038DfF4a39960F5197A43fa76aa"},]
async function bnbTvl(bankAddress, block) {
  let balances = {
    "0x0000000000000000000000000000000000000000": (
      await sdk.api.eth.getBalance({ target: bankAddress, block, chain:'bsc'})
    ).output,
  };
  return balances;
}

function getBSCAddress(address) {
  return `bsc:${address}`
}

async function tvl(timestamp, ethBlock, chainBlocks) {
  /// @dev Initialized variables
  const balances = {}
  const block = chainBlocks.bsc;
  const banksInfos = (await sdk.api.abi.multiCall({
    block,
    abi: abi.banks,
    calls: tokens.map(token => ({
      target: bankAddress,
      params: token
    })),
    chain: 'bsc'
  })).output

  const lendingBalances = banksInfos.filter((n) => {
    return true
  }).map((n) => {
    const stakingTokenAddr = n.input.params[0];
    const i5 = n.output['5'];
    //const i6 = n.output['6'];
    const i8 = n.output['8'];
    return {
      token: stakingTokenAddr,
      balance: BigNumber(i5).plus(BigNumber(i8)).toFixed(0)
    }
  })
  lendingBalances.forEach((s) => {
    balances[getBSCAddress(s.token)] = BigNumber(balances[getBSCAddress(s.token)] || 0).plus(BigNumber(s.balance)).toFixed(0)
  })

  /// @dev bnb
  const bnbBalance = await bnbTvl(bankAddress, block);
  balances[getBSCAddress('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c')] = BigNumber(bnbBalance['0x0000000000000000000000000000000000000000']);

    const lpTotalSupplys = (await sdk.api.abi.multiCall({
      block,
      abi: abi.totalSupply,
      calls: lps.map(n => ({
        target: n['0'],
      })),
      chain: 'bsc'
    })).output

  /// @dev unwrap LP to get underlaying token balances for workers that are working with LPs
  await  unwrapUniswapLPs(balances,
    lps.map((info, index) => {
      /// @dev getting LP address and return the object that unwrapUniswapLPs want
      const lpAddr = info['1'];
      return {
        token: lpAddr,
        balance: BigNumber(lpTotalSupplys[index].output)
      }
    }
  ), block, 'bsc', (addr) => `bsc:${addr}`)

  return balances;
}

module.exports = {
  name: "Bagel Finance",
  token: "Bagel",
  category: "lending",
  start: 1602054167,
  tvl,
};
  