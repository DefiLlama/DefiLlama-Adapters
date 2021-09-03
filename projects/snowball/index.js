const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request");
const BigNumber = require('bignumber.js');
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const abi = require('./abi.json')
const gqlUrl = `https://snob-backend-api.herokuapp.com/graphql`
const query = gql`
query {
  SnowglobeContracts {
		pair
    snowglobeAddress
  }
  StablevaultContracts {
    swapAddress
  }
}
`;

const XSNOB_CONTRACT = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';
const SNOB_TOKEN_CONTRACT = '0xc38f41a296a4493ff429f1238e030924a1542e50';

const tokensToCoinGeckoID = Object.fromEntries(Object.entries({
	'0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98': 'frax',
	'0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB': 'true-usd',
	'0xde3A24028580884448a5397872046a019649b084': 'tether',
	'0xaEb044650278731Ef3DC244692AB9F64C78FfaEA': 'busd',
	'0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a': 'dai',
	'0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651': 'chainlink',
	'0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc': 'sushi',
	'0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB': 'wrapped-bitcoin',
	'0xf39f9671906d8630812f9d9863bBEf5D523c84Ab': 'uniswap',
	'0x8cE2Dee54bB9921a2AE0A63dBb2DF8eD88B91dD9': 'aave',
	'0x99519AcB025a0e0d44c3875A4BbF03af65933627': 'yearn-finance',
	'0x846d50248baf8b7ceaa9d9b53bfd12d7d7fbb25a': 'verso',
	'0x564A341Df6C126f90cf3ECB92120FD7190ACb401': 'bilira',
	'0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33': 'joe',
	'0x264c1383EA520f73dd837F915ef3a732e204a493': 'binancecoin',
	'0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664': 'usd-coin',
	'0xAcD7B3D9c10e97d0efA418903C0c7669E702E4C0': 'eleven-finance',
	'0x9E037dE681CaFA6E661e6108eD9c2bd1AA567Ecd': 'allianceblock'
}).map(t=>[t[0].toLowerCase(), t[1]]));

async function convertBalancesToCoinGecko(balances) {
	const newBalances = {}
	await Promise.all(Object.entries(balances).map(async ([rawToken, balance]) => {
			const token = rawToken.split(':')[1];
			const decimals = await sdk.api.erc20.decimals(token, 'avax');
			if (token.toLowerCase() in tokensToCoinGeckoID) {
				newBalances[tokensToCoinGeckoID[token.toLowerCase()]] = BigNumber(balance).div(10 ** Number(decimals.output)).toNumber();
			} else {
				newBalances[rawToken] = balance;
			}
	}));
	return newBalances
}

async function getxSNOBBalance(balances, block) {
	await sdk.api.abi.call({
		target: SNOB_TOKEN_CONTRACT,
		params: [XSNOB_CONTRACT],
		block,
		chain: 'avax',
		abi: 'erc20:balanceOf'
	}).then(stakedSnob => {
		sdk.util.sumSingleBalance(balances, `avax:${SNOB_TOKEN_CONTRACT}`, stakedSnob.output);
	});
}

async function getStableVaultBalances(balances, stablevaults, block) {
	await Promise.all(stablevaults.map(async (vault) => {
		await sdk.api.abi.multiCall({
			calls: [0, 1, 2, 3].map(num => ({
				target: vault.swapAddress,
				params: [num]
			})),
			abi: abi.getToken,
			block,
			chain: 'avax'
		}).then(async tokens => {
			await sdk.api.abi.multiCall({
				calls: tokens.output.filter(t => t.output != null).map(token => ({
					target: token.output,
					params: [vault.swapAddress]
				})),
				abi: 'erc20:balanceOf',
				block,
				chain: 'avax'
			}).then(tokenBalances => {
				const balancesToAdd = {};
				sdk.util.sumMultiBalanceOf(balancesToAdd, tokenBalances);
				Object.entries(balancesToAdd).forEach(balance => {
					sdk.util.sumSingleBalance(balances, `avax:${balance[0]}`, balance[1]);
				});
			});
		});
	}));
}

async function getSnowglobeBalances(balances, snowglobes, block) {
	const singleSidedPairs = {
		calls: snowglobes.filter((globe) => !globe.pair.includes("-")).map(globe => ({
			target: globe.snowglobeAddress
		})),
		block,
		chain: 'avax'
	}
	const [tokens, tokenBalances] = await Promise.all([
		sdk.api.abi.multiCall({
			...singleSidedPairs,
			abi: abi.token
		}),
		sdk.api.abi.multiCall({
			...singleSidedPairs,
			abi: abi.balance			
		})
	])
	await Promise.all(tokens.output.map((token, idx) => {
		sdk.util.sumSingleBalance(balances, `avax:${token.output}`, tokenBalances.output[idx].output);
	}));

	snowglobes = snowglobes.filter((globe) => globe.pair.includes("-"));
	const globes = {
		calls: snowglobes.map(globe => ({
				target: globe.snowglobeAddress,
		})),
		block,
		chain: 'avax'
	};
	const [lpTokens, lpTokenBalances] = await Promise.all([
		sdk.api.abi.multiCall({
				...globes,
				abi: abi.token,
		}),
		sdk.api.abi.multiCall({
				...globes,
				abi: abi.balance,
		}),
	]);

	const lpPositions = lpTokens.output.map((lpToken, idx) => ({
		token: lpToken.output,
		balance: lpTokenBalances.output[idx].output
	}));
	await unwrapUniswapLPs(balances, lpPositions, block, 'avax', (addr) => `avax:${addr}`);
}

async function tvl(_timestamp, _ethereumBlock, chainBlocks) {
	const balances = {}
	const block = chainBlocks['avax'];
	const data = await request(gqlUrl, query);
	
	await getxSNOBBalance(balances, block);
	await getStableVaultBalances(balances, data.StablevaultContracts, block);
	await getSnowglobeBalances(balances, data.SnowglobeContracts, block);

	return await convertBalancesToCoinGecko(balances);
}

module.exports = {
    avalanche: {
        tvl,
    },
    tvl
}
