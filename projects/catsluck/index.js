const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');

const CHAIN = "smartbch"

// token contracts
const CLK = "0x659F04F36e90143fCaC202D4BC36C699C078fC98"

// staking pool addresses
const catsPoolAddress = "0x659F04F36e90143fCaC202D4BC36C699C078fC98"
const bchPoolAddress = "0x4d16fB4811cf8BF7a5d35397527A95911E122611"
const flexusdPoolAddress = "0xC5bBdf3838BA468359a5a97523925350dfcc3599"
const daoPoolAddress = "0x5BBAE609bd2e6E0c6c59401e59B5358F0C1D16b1"
const ebenPoolAddress = "0x404B74F4B945A51FCAcF3B86b28c248aBD9496eB"
const mistPoolAddress = "0xFbc43093c71c960F26Eed32Ec73F3d096F02C053"
const tangoPoolAddress = "0x43A4a713e3248Ab6CB05EB9c817355Ea85E580Ca"
const lawPoolAddress = "0x3F52E5e897AfC6e7BF8C6A4e88f86fc6B9Ce645b"

// [[pool address, coingecko-id, decimals]]
const stakingPools = [
    [catsPoolAddress, "cashcats", 2],
    [bchPoolAddress, "bitcoin-cash", 18],
    [flexusdPoolAddress, "flex-usd", 18],
    [daoPoolAddress, 'decentralized-autonomous-organization', 7],
    [ebenPoolAddress, "green-ben", 18],
    [mistPoolAddress, "mistswap", 18],
    [tangoPoolAddress, "tangoswap", 18],
    [lawPoolAddress, "law", 18]
]

// "function info(address addr) external view returns (uint, uint, uint)""
const poolInfoAbi = 'function info(address addr) view returns (uint256 totalBalance, uint256 totalShare, uint256 sharesAndLockUntil)'


const tvl = async (timestamp, ethBlock, {[CHAIN]: block}) => {

    const totals = await Promise.all(stakingPools.map(async (pool) => {
        const [poolAddress, addr, decimals] = pool;
        const total = (await sdk.api.abi.call({
            target: poolAddress,
            params: [bchPoolAddress],
            abi: poolInfoAbi,
            chain: CHAIN,
            block
        })).output.totalBalance

        return {[addr]: BigNumber(total).dividedBy(10 ** decimals).toNumber()}
    }))
    return totals.reduce((a, b) => ({...a, ...b}), {})
}

module.exports = {
    deadFrom: '2025-06-01',
    misrepresentedTokens: true,
    methodology: "Total value of non-native tokens staked in prediction pools is counted towards tvl metric.",
    smartbch: { tvl },
}
