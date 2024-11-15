import { StoreContract } from "@/contracts";
import { ResultType } from "@/contracts/result.type";
import { getRight, isLeft } from "@/utilities";
import delayUtility from "@/utilities/delay.utility";
import task from "./task.impl";

type LoopConsume<T, R> = {
  parallel: number;
  delayBetweenTasks: number;
  delayAfterBatch: number;
  minWaitTimeExceededRateLimit: number;
  store: StoreContract<T>;
  fn: (data: T) => Promise<R>;
};

export async function loopConsume<T>({
  parallel,
  delayBetweenTasks,
  delayAfterBatch,
  minWaitTimeExceededRateLimit,
  store,
  fn,
}: LoopConsume<T, ResultType>) {
  let waitTimeExceededDate = new Date();

  while (true) {
    const taskPool: Promise<void>[] = [];

    const storeToConsume = await store.getAllDataFromQueue("STORE_TO_CONSUME");
    const storeToRetry = await store.getAllDataFromQueue(
      "STORE_WITH_ERROR_TO_RETRY"
    );

    if (isLeft(storeToConsume) && isLeft(storeToRetry)) {
      continue;
    }

    const data = [...getRight(storeToRetry), ...getRight(storeToConsume)];

    if (data.length === 0) {
      continue;
    }

    const dataLengthWithTaskPool = data.length + taskPool.length < parallel;
    const diffExceededWaitTime =
      new Date().getTime() - waitTimeExceededDate.getTime();

    if (
      dataLengthWithTaskPool &&
      diffExceededWaitTime < minWaitTimeExceededRateLimit
    ) {
      console.log("Waiting for rate limit to reset");

      await delayUtility(minWaitTimeExceededRateLimit);
      waitTimeExceededDate = new Date();

      continue;
    }

    const dataSorted = data.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    for (const data of dataSorted) {
      if (taskPool.length >= parallel) {
        console.log("Waiting for batch to finish");
        await Promise.all(taskPool);
        taskPool.length = 0;
        await delayUtility(delayAfterBatch);
      }

      taskPool.push(task(store, data, fn));
      await delayUtility(delayBetweenTasks);
    }

    if (taskPool.length > 0) {
      console.log("Waiting for batch to finish");
      await Promise.all(taskPool);
    }
  }
}
