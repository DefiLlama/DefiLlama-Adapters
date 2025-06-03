const { nullAddress } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');

function staking(contract, token) {
  return async (api) => {
    const totalSupply = await api.call({ target: contract, abi: 'erc20:totalSupply' });
    api.add(token, totalSupply);
  };
}

const WBTC = {
  ethereum: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  arbitrum: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
  berachain: '0x0555e30da8f98308edb960aa94c0db47230d2b9c',
};
const LBTC = {
  ethereum: '0x8236a87084f8b84306f72007f36f2618a5634494',
  base: '0xecac9c5f704e954931349da37f60e39f515c11c1',
  berachain: '0xecac9c5f704e954931349da37f60e39f515c11c1',
};
const CBBTC = {
  ethereum: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
  base: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
  arbitrum: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
};

const fetchQueuedWithdrawalsAbi = "function fetchQueuedWithdrawals(address staker) view returns (tuple(address staker, address delegatedTo, uint256 nonce, uint256 start, tuple(address[] vaults, uint256[] shares, address withdrawer) request)[] queuedWithdrawals)"
const isWithdrawPendingAbi = "function isWithdrawPending(tuple(address staker, address delegatedTo, uint256 nonce, uint256 start, tuple(address[] vaults, uint256[] shares, address withdrawer) request) withdrawal) view returns (bool)"

async function get_karak_btc_withdrawals(timestamp) {
  const api = new sdk.ChainApi({ timestamp, chain: 'ethereum' })
  const karak_btc = await api.call({ target: '0xAfa904152E04aBFf56701223118Be2832A4449E0', abi: fetchQueuedWithdrawalsAbi, params: ['0x657e8C867D8B37dCC18fA4Caead9C45EB088C642'] })
  let total_btc_in_queued_withdrawals = 0
  for (const withdrawal of karak_btc) {
    const isWithdrawPending = await api.call({ target: '0xAfa904152E04aBFf56701223118Be2832A4449E0', abi: isWithdrawPendingAbi, params: [withdrawal] })
    if (isWithdrawPending) {
      for (const share of withdrawal.request.shares) {
        total_btc_in_queued_withdrawals += Number(share)
      }
    }
  }
  return total_btc_in_queued_withdrawals
}

async function ebtc_staking(timestamp) {
  if (timestamp < 1746507563) return [0n, 0n, 0n];

  const EBTC = '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642';
  let wbtc_held = 0n, lbtc_held = 0n, cbbtc_held = 0n;

  const collectBalances = async (tokens, accumulator) => {
    let sum = accumulator;
    for (const [chain, token] of Object.entries(tokens)) {
      const result = await sdk.api.erc20.balanceOf({
        target: token,
        owner: EBTC,
        chain,
        timestamp,
      });
      sum += BigInt(result.output);
    }
    return sum;
  };
  
  wbtc_held = await collectBalances(WBTC, wbtc_held);
  lbtc_held = await collectBalances(LBTC, lbtc_held);
  cbbtc_held = await collectBalances(CBBTC, cbbtc_held);

  console.log(wbtc_held, lbtc_held, cbbtc_held);

  const getEthBalance = async (token, owner) => {
    const result = await sdk.api.erc20.balanceOf({
      target: token,
      owner,
      chain: 'ethereum',
      timestamp,
    });
    return BigInt(result.output);
  };

  const ethExtras = await Promise.all([
    getEthBalance('0x468c34703F6c648CCf39DBaB11305D17C70ba011', EBTC),
    getEthBalance('0x126d4dBf752AaF61f3eAaDa24Ab0dB84FEcf6891', EBTC),
    getEthBalance('0x9C0823D3A1172F9DdF672d438dec79c39a64f448', EBTC),
    getEthBalance('0x971e5b5D4baa5607863f3748FeBf287C7bf82618', EBTC),
    getEthBalance(LBTC.ethereum, '0xd4E20ECA1f996Dab35883dC0AD5E3428AF888D45'),
  ]);

  const karak_btc_withdrawals = await get_karak_btc_withdrawals(timestamp);

  lbtc_held += ethExtras[0] + ethExtras[2] + ethExtras[4] + BigInt(karak_btc_withdrawals);
  wbtc_held += ethExtras[1] + ethExtras[3];

  return [lbtc_held, wbtc_held, cbbtc_held];
}

module.exports = {
  doublecounted: true,

  ethereum: {
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB"),

    tvl: async ({ timestamp }) => {
      const [lbtc_held, wbtc_held, cbbtc_held] = await ebtc_staking(timestamp);

      const ethSupply = await sdk.api.abi.call({
        target: '0x6329004E903B7F420245E7aF3f355186f2432466',
        abi: 'uint256:getTvl',
        chain: 'optimism',
        timestamp,
      });

      let loopedTvl = 0n;
      if (timestamp > 1746507563) {
        const looped = await sdk.api.abi.call({
          target: '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da',
          abi: 'function categoryTVL(string _category) view returns (uint256)',
          params: ['liquideth'],
          chain: 'optimism',
          timestamp,
        });
        loopedTvl = BigInt(looped.output);
      }

      const etherfiEthTvl = BigInt(ethSupply.output) - loopedTvl;

      const eusd = await sdk.api.abi.call({
        target: '0x939778D83b46B456224A33Fb59630B11DEC56663',
        abi: 'uint256:totalSupply',
        chain: 'ethereum',
        timestamp,
      });

      return {
        [nullAddress]: etherfiEthTvl.toString(),
        [ADDRESSES.ethereum.USDC]: (BigInt(eusd.output) / 10n ** 12n).toString(),
        [LBTC.ethereum]: lbtc_held.toString(),
        [WBTC.ethereum]: wbtc_held.toString(),
        [CBBTC.ethereum]: cbbtc_held.toString(),
      };
    }
  },

  arbitrum: {
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0x7189fb5b6504bbff6a852b13b7b82a3c118fdc27")
  },

  base: {
    staking: staking("0x86B5780b606940Eb59A062aA85a07959518c0161", "0x7189fb5b6504bbff6a852b13b7b82a3c118fdc27")
  }
};
