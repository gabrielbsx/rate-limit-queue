export type StoreType<T = unknown> = {
  name: string;
  id: string;
  data: T;
  timestamp: Date;
  attempts: number;
  queue: StoreQueueType;
};

export type StoreCreationType<T = unknown> = Omit<
  StoreType<T>,
  "id" | "timestamp" | "attempts" | "queue"
>;

export type StoreQueueType =
  | "STORE_TO_CONSUME"
  | "STORE_WITH_ERROR_TO_RETRY"
  | "STORE_CONSUMED";
