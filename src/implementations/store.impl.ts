import {
  StoreContract,
  StoreCreationType,
  StoreQueueType,
  StoreType,
} from "@/contracts";
import { getRight, isLeft, left, match, right } from "@/utilities";
import { randomUUID } from "crypto";

export default class StoreImpl<T> implements StoreContract<T> {
  static STORE: StoreType<unknown>[] = [];

  async addToConsume({ name, data }: StoreCreationType<T>) {
    const id = randomUUID();

    StoreImpl.STORE.push({
      name,
      data,
      id,
      timestamp: new Date(),
      attempts: 0,
      queue: "STORE_TO_CONSUME",
    });

    return right(id);
  }

  async moveQueue(id: string, from: StoreQueueType, to: StoreQueueType) {
    const index = StoreImpl.STORE.findIndex(
      (store) => store.id === id && store.queue === from
    );

    if (index === -1) {
      return left(new Error("Data not found"));
    }

    const storeOrNothing = StoreImpl.STORE[index];

    if (!storeOrNothing) {
      return left(new Error("Data not found"));
    }

    const storeWithAttempt = await match(to, {
      STORE_CONSUMED: async () =>
        right({
          ...storeOrNothing,
          attempts: storeOrNothing.attempts + 1,
        }),
      STORE_WITH_ERROR_TO_RETRY: async () =>
        right({
          ...storeOrNothing,
          attempts: storeOrNothing.attempts + 1,
        }),
    });

    if (isLeft(storeWithAttempt)) {
      return storeWithAttempt;
    }

    StoreImpl.STORE[index] = { ...getRight(storeWithAttempt), queue: to };

    return right(true);
  }

  async getDataFromQueue(id: string, queue: StoreQueueType) {
    const store = StoreImpl.STORE.find(
      (store) => store.id === id && store.queue === queue
    );

    if (!store) {
      return left(new Error("Data not found"));
    }

    return right(store as StoreType<T>);
  }

  async getAllDataFromQueue(queue: StoreQueueType) {
    const data = StoreImpl.STORE.filter(
      (store) => store.queue === queue
    ) as StoreType<T>[];

    if (!data) {
      return left(new Error("Data not found"));
    }

    return right(data);
  }

  async getDataFromQueueByName(queue: StoreQueueType, name: string) {
    const data = StoreImpl.STORE.filter(
      (store) => store.name === name
    ) as StoreType<T>[];

    if (!data) {
      return left(new Error("Data not found"));
    }

    return right(data as StoreType<T>[]);
  }
}
