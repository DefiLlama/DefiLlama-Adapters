import { request } from "graphql-request";

export async function getPagedGql(url: string, query: string, itemName: string, pageSize = 1000) {
  let lastId = "";
  let all = [] as any[];
  let page;
  do {
    page = (
      await request(url, query, {
        lastId,
        pageSize,
      })
    )[itemName];
    all = all.concat(page);
    lastId = page[page.length - 1]?.id;
  } while (page.length === pageSize);
  return all;
}
