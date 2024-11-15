import { Either } from "@/utilities/either.utility";
import { StoreCreationType, StoreQueueType, StoreType } from "./store.type";

export interface StoreContract<T = unknown> {
  addToConsume(store: StoreCreationType<T>): Promise<Either<string>>;

  moveQueue(
    id: string,
    from: StoreQueueType,
    stack: StoreQueueType
  ): Promise<Either<boolean>>;

  getDataFromQueue(
    id: string,
    queue: StoreQueueType
  ): Promise<Either<StoreType<T>>>;

  getAllDataFromQueue(queue: StoreQueueType): Promise<Either<StoreType<T>[]>>;

  getDataFromQueueByName(
    queue: StoreQueueType,
    name: string
  ): Promise<Either<StoreType<T>[]>>;
}
