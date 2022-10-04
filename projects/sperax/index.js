const sdk = require("@defillama/sdk");
const abi = require("../sperax/abi.json");
const {staking} = require("../helper/staking.js");

const ethStakingAddr = "0xbF82a3212e13b2d407D10f5107b5C8404dE7F403";
const arbStakingAddr = "0x2e2071180682Ce6C247B1eF93d382D509F5F6A17";

const vaultcore = '0xF783DD830A4650D2A8594423F123250652340E3f';

const SPA = '0x5575552988a3a80504bbaeb1311674fcfd40ad4b';
const ethSPA = '0xB4A3B0Faf0Ab53df58001804DdA5Bfc6a3D59008';
const USDsAddress = '0xD74f5255D557944cf7Dd0E45FF521520002D5748';

async function tvl(timestamp, ethBlock, chainBlocks) {
    const chain = 'arbitrum';
    const block = chainBlocks[chain];

    let tvlInUSD = (await sdk.api.abi.call({
        abi: abi.totalValueLocked,
        chain: chain,
        target: vaultcore,
        params: [],
        block: block
    })).output;

    return {
      tether: tvlInUSD / 1e18
    }
}

module.exports = {
  misrepresentedTokens: true,
    arbitrum: {
        tvl,
        staking: staking(arbStakingAddr, SPA, "arbitrum", `arbitrum:${SPA}`)
    },
    ethereum: {
        tvl: () => ({}),
        staking: staking(ethStakingAddr, ethSPA)
    },
    methodology: 'Counts all collateral locked to mint USDs.This collateral is either sent to DeFi strategies to produce an organic yield, or is stored in the VaultCore contract of the USDs protocol. Some TVL is classified as staking. This component of TVL consists of all SPA staked in Sperax’s veSPA protocol.'
};