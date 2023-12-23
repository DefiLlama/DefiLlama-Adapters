import * as sdk from "@defillama/sdk";
import { getBalance } from "@defillama/sdk/build/eth";
import { Adapter, ChainBlocks, FetchResultFees } from "../../adapters/types";
import { getBlock } from "../../helpers/getBlock";
import { getPrices } from "../../utils/prices";
import { CHAIN } from "../../helpers/chains";
import postgres from "postgres";

/** Address to check = bankpadtreasury.eth */
const CONTRACT_ADDRESS = "0x67262A61c0A459Fff172c22E60DBC730393BF790";

/** Check ether balance at a given block number*/
interface IBalance {
    daily: string;
    total: string;
}

const checkBalance = async (timestamp: number, chainBlocks: ChainBlocks): Promise<IBalance> => {
    const fromTimestamp = timestamp - 60 * 60 * 24
    const toTimestamp = timestamp
    const currentBlock = await getBlock(toTimestamp, CHAIN.ETHEREUM, chainBlocks);
    const yesterdayBlock = await getBlock(fromTimestamp, CHAIN.ETHEREUM, {});

    const paramsCurrent = {
        target: CONTRACT_ADDRESS,
        block: currentBlock,
        chain: CHAIN.ETHEREUM,
    }

    const paramsYesterday = {
        target: CONTRACT_ADDRESS,
        block: yesterdayBlock,
        chain: CHAIN.ETHEREUM,
    }

    const currentBalance = (await getBalance(paramsCurrent)).output;
    const yesterdayBalance = (await getBalance(paramsYesterday)).output;

    return {
        daily: (Number(currentBalance) - Number(yesterdayBalance)).toString(),
        total: Number(currentBalance).toString()
    } as IBalance
}
interface IData {
    eth_value: string;
  }

/** Calculate USD equivalent for a given ether amount */
async function usdEquivalent(_: string, timestamp: number) {
    const sql = postgres(process.env.INDEXA_DB!);

    const now = new Date(timestamp * 1e3)
    const dayAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24)
    try {
      const revenue_split = await sql`
        SELECT
          block_number,
          block_time,
          "value" / 1e18 as eth_value,
          encode(transaction_hash, 'hex') AS HASH,
          encode(to_address, 'hex') AS to_address
        FROM
          ethereum.traces
        WHERE
          block_number > 17539904
          and to_address = '\\x67262A61c0A459Fff172c22E60DBC730393BF790'
          and error is null
          AND block_time BETWEEN ${dayAgo.toISOString()} AND ${now.toISOString()};
      `;

      const transactions: IData[] = [...revenue_split] as IData[]
      const amount = transactions.reduce((a: number, transaction: IData) => a+Number(transaction.eth_value), 0)

      const ethAddress = "ethereum:0x0000000000000000000000000000000000000000";
      const ethPrice = (await getPrices([ethAddress], timestamp))[ethAddress].price;
      const amountUSD = amount * ethPrice;
      const dailyFees = amountUSD;
      await sql.end({ timeout: 3 })
      return dailyFees;
    } catch (error) {
      await sql.end({ timeout: 3 })
      console.error(error);
      throw error;
    }
}

/** Adapter */
const adapter: Adapter = {
    adapter: {
        ethereum: {
            fetch: async (timestamp: number, chainBlocks: ChainBlocks): Promise<FetchResultFees> => {
                const { daily } = await checkBalance(timestamp, chainBlocks);
                const dailyFees = await usdEquivalent(daily, timestamp)
                return {
                    timestamp,
                    dailyFees: dailyFees.toString(),
                };
            },
            start: async () => 1690070400,
        },
    },
}

export default adapter;