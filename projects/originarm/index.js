const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const OETH = "0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3"

      const lidoArm = "0x85b78aca6deae198fbf201c82daf6ca21942acc6";
      const oethArm = "0x6bac785889A4127dB0e0CeFEE88E0a9F1Aaf3cC7";
      const etherfiArm = "0xfB0A3CF9B019BFd8827443d131b235B3E0FC58d2";
      const ethenaArm = "0xCEDa2d856238aA0D12f6329de20B9115f07C366d";

      const outstanding_STETH = await api.call({ abi: 'uint256:lidoWithdrawalQueueAmount', target: lidoArm });
      api.add(ADDRESSES.ethereum.STETH, outstanding_STETH);

      const outstanding_OETH = await api.call({ abi: 'uint256:vaultWithdrawalAmount', target: oethArm });
      api.add(OETH, outstanding_OETH);

      const outstanding_EETH = await api.call({ abi: 'uint256:etherfiWithdrawalQueueAmount', target: etherfiArm });
      api.add(ADDRESSES.ethereum.EETH, outstanding_EETH);

      const outstanding_sUSDe = await api.call({ abi: 'uint256:liquidityAmountInCooldown', target: ethenaArm });
      api.add(ADDRESSES.ethereum.sUSDe, outstanding_sUSDe);

      return api.sumTokens({ tokensAndOwners: [
        // Lido ARM
        [ADDRESSES.ethereum.WETH, lidoArm],
        [ADDRESSES.ethereum.STETH, lidoArm],
        // OETH ARM
        [ADDRESSES.ethereum.WETH, oethArm],
        [OETH, oethArm],     
        // Etherfi ARM
        [ADDRESSES.ethereum.WETH, etherfiArm],
        [ADDRESSES.ethereum.EETH, etherfiArm],
        // Ethena ARM
        [ADDRESSES.ethereum.USDe, ethenaArm],
        [ADDRESSES.ethereum.sUSDe, ethenaArm],
      ]});
    },
  },
  sonic: {
    tvl: async (api) => {
      const OS = "0xb1e25689D55734FD3ffFc939c4C3Eb52DFf8A794"
      // OS ARM
      const osArm = "0x2F872623d1E1Af5835b08b0E49aAd2d81d649D30";
      const outstandingOs = await api.call({ abi: 'uint256:vaultWithdrawalAmount', target: osArm });
      api.add(OS, outstandingOs);
      return api.sumTokens({ tokensAndOwners: [
        // OS ARM
        [ADDRESSES.sonic.wS, osArm],
        [OS, osArm],
      ]});
    },
  },
};
