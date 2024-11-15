import { StoreType } from "@/contracts";
import { resultType } from "@/enums/result.enum";
import { describe, expect, it, vi } from "vitest";
import StoreImpl from "./store.impl";
import task from "./task.impl";

type StoreDataTest = {
  name: string;
  age: number;
};

const makeSut = () => {
  const store = new StoreImpl<StoreDataTest>();
  return { store };
};

const makeData = (): StoreType<StoreDataTest> => {
  return {
    id: "test-id",
    name: "store-test",
    data: { name: "Jane Doe", age: 30 },
    queue: "STORE_TO_CONSUME",
    timestamp: new Date(),
    attempts: 0,
  };
};

const doubleOkFn = vi.fn().mockResolvedValue(resultType.OK);
const doubleErrorFn = vi.fn().mockResolvedValue(resultType.ERROR);

describe("task function", () => {
  it("should move data to STORE_CONSUMED if result is OK", async () => {
    const { store } = makeSut();
    const storeData = makeData();

    await store.addToConsume({ name: storeData.name, data: storeData.data });

    const storeDataFromQueue = await store.getDataFromQueue(
      storeData.id,
      "STORE_TO_CONSUME"
    );

    expect(storeDataFromQueue).not.toBeFalsy();

    await task(store, storeData, doubleOkFn);

    const movedData = await store.getDataFromQueue(
      storeData.id,
      "STORE_CONSUMED"
    );

    expect(movedData).not.toBeFalsy();
    expect(doubleOkFn).toHaveBeenCalledWith(storeData.data);
  });

  it("should move data to STORE_WITH_ERROR_TO_RETRY if result is ERROR", async () => {
    const { store } = makeSut();
    const storeData = makeData();

    await store.addToConsume({ name: storeData.name, data: storeData.data });

    const storeDataFromQueue = await store.getDataFromQueue(
      storeData.id,
      "STORE_TO_CONSUME"
    );

    expect(storeDataFromQueue).not.toBeFalsy();

    await task(store, storeData, doubleErrorFn);

    const movedData = await store.getDataFromQueue(
      storeData.id,
      "STORE_WITH_ERROR_TO_RETRY"
    );

    expect(movedData).not.toBeFalsy();
    expect(doubleErrorFn).toHaveBeenCalledWith(storeData.data);
  });

  it("should not move data if result is not recognized", async () => {
    const { store } = makeSut();
    const storeData = makeData();

    await store.addToConsume({ name: storeData.name, data: storeData.data });

    const storeDataFromQueue = await store.getDataFromQueue(
      storeData.id,
      "STORE_TO_CONSUME"
    );

    expect(storeDataFromQueue).not.toBeFalsy();

    const mockFunction = vi.fn().mockResolvedValue("UNKNOWN");

    await task(store, storeData, mockFunction);

    const dataInOriginalQueue = await store.getDataFromQueue(
      storeData.id,
      "STORE_TO_CONSUME"
    );

    expect(dataInOriginalQueue).not.toBeFalsy();
    expect(mockFunction).toHaveBeenCalledWith(storeData.data);
  });
});
