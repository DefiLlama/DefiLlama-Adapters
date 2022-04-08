import { getTVL } from './src/tvl/tvl.service.js';

export async function main() {
    return await getTVL();
}
main();
