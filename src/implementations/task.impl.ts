import { StoreContract, StoreType } from "@/contracts";
import { ResultType } from "@/contracts/result.type";
import { match } from "@/utilities";

export default async function task<T>(
  store: StoreContract<T>,
  storeData: StoreType<T>,
  fn: (data: T) => Promise<ResultType>
) {
  const result = await fn(storeData.data);

  const matchFns = {
    OK: async () => {
      return await store.moveQueue(
        storeData.id,
        storeData.queue,
        "STORE_CONSUMED"
      );
    },
    ERROR: async () => {
      return await store.moveQueue(
        storeData.id,
        storeData.queue,
        "STORE_WITH_ERROR_TO_RETRY"
      );
    },
  };

  await match(result, matchFns);
}
