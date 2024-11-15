import { getRight, isLeft, isRight } from "@/utilities/either.utility";
import { describe, expect, it } from "vitest";
import StoreImpl from "./store.impl";

type StoreDataTest = {
  name: string;
  age: number;
};

const makeSut = () => {
  const store = new StoreImpl();
  return { store };
};

const makeData = () => {
  const testData: StoreDataTest = {
    name: "John Doe",
    age: 25,
  };

  return testData;
};

describe("StoreImpl", () => {
  it("should add data correctly", async () => {
    const { store } = makeSut();
    const testData = makeData();

    const storeIdEither = await store.addToConsume({
      data: testData,
      name: "store-test-01",
    });

    expect(storeIdEither).not.toBeFalsy();

    expect(isRight(storeIdEither)).toBeTruthy();

    expect(isLeft(storeIdEither)).toBeFalsy();

    const storeId = getRight(storeIdEither);

    const storeFromQueueEither = await store.getDataFromQueue(
      storeId,
      "STORE_TO_CONSUME"
    );

    expect(isRight(storeFromQueueEither)).toBeTruthy();
    expect(isLeft(storeFromQueueEither)).toBeFalsy();

    const storeFromQueue = getRight(storeFromQueueEither);

    expect(storeFromQueue).toMatchObject({
      data: testData,
      name: "store-test-01",
      id: storeId,
    });
  });

  it("should get data correctly", async () => {
    const { store } = makeSut();
    const testData = makeData();

    const storeIdEither = await store.addToConsume({
      data: testData,
      name: "store-test-02",
    });

    expect(storeIdEither).not.toBeFalsy();

    expect(isRight(storeIdEither)).toBeTruthy();

    expect(isLeft(storeIdEither)).toBeFalsy();

    const storeId = getRight(storeIdEither);

    const storeFromQueueEither = await store.getDataFromQueue(
      storeId,
      "STORE_TO_CONSUME"
    );

    expect(isRight(storeFromQueueEither)).toBeTruthy();
    expect(isLeft(storeFromQueueEither)).toBeFalsy();

    const storeFromQueue = getRight(storeFromQueueEither);

    expect(storeFromQueue).toMatchObject({
      data: testData,
      name: "store-test-02",
      id: storeId,
    });

    const storeFromGetEither = await store.getDataFromQueue(
      storeId,
      "STORE_TO_CONSUME"
    );

    expect(isRight(storeFromGetEither)).toBeTruthy();
    expect(isLeft(storeFromGetEither)).toBeFalsy();

    const storeFromGet = getRight(storeFromGetEither);

    expect(storeFromGet).toMatchObject({
      data: testData,
      name: "store-test-02",
      id: storeId,
    });
  });

  it("should move data into queues correctly", async () => {
    const { store } = makeSut();
    const testData = makeData();

    const storeIdEither = await store.addToConsume({
      data: testData,
      name: "store-test-03",
    });

    expect(storeIdEither).not.toBeFalsy();

    expect(isRight(storeIdEither)).toBeTruthy();

    expect(isLeft(storeIdEither)).toBeFalsy();

    const storeId = getRight(storeIdEither);

    const storeFromQueueEither = await store.getDataFromQueue(
      storeId,
      "STORE_TO_CONSUME"
    );

    expect(isRight(storeFromQueueEither)).toBeTruthy();
    expect(isLeft(storeFromQueueEither)).toBeFalsy();

    const storeFromQueue = getRight(storeFromQueueEither);

    expect(storeFromQueue).toMatchObject({
      data: testData,
      name: "store-test-03",
      id: storeId,
    });

    const storeMoveEither = await store.moveQueue(
      storeId,
      "STORE_TO_CONSUME",
      "STORE_WITH_ERROR_TO_RETRY"
    );

    expect(isRight(storeMoveEither)).toBeTruthy();
    expect(isLeft(storeMoveEither)).toBeFalsy();

    const storeFromProcessEither = await store.getDataFromQueue(
      storeId,
      "STORE_WITH_ERROR_TO_RETRY"
    );

    expect(isRight(storeFromProcessEither)).toBeTruthy();
    expect(isLeft(storeFromProcessEither)).toBeFalsy();

    const storeFromProcess = getRight(storeFromProcessEither);

    expect(storeFromProcess).toMatchObject({
      data: testData,
      name: "store-test-03",
      id: storeId,
    });

    const storeMoveEitherToConsumed = await store.moveQueue(
      storeId,
      "STORE_WITH_ERROR_TO_RETRY",
      "STORE_CONSUMED"
    );

    expect(isRight(storeMoveEitherToConsumed)).toBeTruthy();
    expect(isLeft(storeMoveEitherToConsumed)).toBeFalsy();

    const storeFromConsumedEither = await store.getDataFromQueue(
      storeId,
      "STORE_CONSUMED"
    );

    expect(isRight(storeFromConsumedEither)).toBeTruthy();
    expect(isLeft(storeFromConsumedEither)).toBeFalsy();
  });

  it("should be empty after consumed", async () => {
    const { store } = makeSut();
    const testData = makeData();

    const storeIdEither = await store.addToConsume({
      data: testData,
      name: "store-test-04",
    });

    expect(storeIdEither).not.toBeFalsy();

    expect(isRight(storeIdEither)).toBeTruthy();

    expect(isLeft(storeIdEither)).toBeFalsy();

    const storeId = getRight(storeIdEither);

    const storeFromQueueEither = await store.getDataFromQueue(
      storeId,
      "STORE_TO_CONSUME"
    );

    expect(isRight(storeFromQueueEither)).toBeTruthy();
    expect(isLeft(storeFromQueueEither)).toBeFalsy();

    const storeFromQueue = getRight(storeFromQueueEither);

    expect(storeFromQueue).toMatchObject({
      data: testData,
      name: "store-test-04",
      id: storeId,
    });

    const storeMoveEither = await store.moveQueue(
      storeId,
      "STORE_TO_CONSUME",
      "STORE_CONSUMED"
    );

    expect(isRight(storeMoveEither)).toBeTruthy();
    expect(isLeft(storeMoveEither)).toBeFalsy();

    const storeFromConsumedEither = await store.getDataFromQueue(
      storeId,
      "STORE_CONSUMED"
    );

    expect(isRight(storeFromConsumedEither)).toBeTruthy();
    expect(isLeft(storeFromConsumedEither)).toBeFalsy();

    const storeFromConsumed = getRight(storeFromConsumedEither);

    expect(storeFromConsumed).toMatchObject({
      data: testData,
      name: "store-test-04",
      id: storeId,
    });

    const storeFromQueueAfterEither = await store.getDataFromQueue(
      storeId,
      "STORE_TO_CONSUME"
    );

    expect(isRight(storeFromQueueAfterEither)).toBeFalsy();
    expect(isLeft(storeFromQueueAfterEither)).toBeTruthy();
  });

  it("should be able to retry", async () => {
    const { store } = makeSut();
    const testData = makeData();

    const storeIdEither = await store.addToConsume({
      data: testData,
      name: "store-test-05",
    });

    expect(storeIdEither).not.toBeFalsy();

    expect(isRight(storeIdEither)).toBeTruthy();

    expect(isLeft(storeIdEither)).toBeFalsy();

    const storeId = getRight(storeIdEither);

    const storeFromQueueEither = await store.getDataFromQueue(
      storeId,
      "STORE_TO_CONSUME"
    );

    expect(isRight(storeFromQueueEither)).toBeTruthy();
    expect(isLeft(storeFromQueueEither)).toBeFalsy();

    const storeFromQueue = getRight(storeFromQueueEither);

    expect(storeFromQueue).toMatchObject({
      data: testData,
      name: "store-test-05",
      id: storeId,
    });

    const storeMoveEither = await store.moveQueue(
      storeId,
      "STORE_TO_CONSUME",
      "STORE_WITH_ERROR_TO_RETRY"
    );

    expect(isRight(storeMoveEither)).toBeTruthy();
    expect(isLeft(storeMoveEither)).toBeFalsy();

    const storeFromProcessEither = await store.getDataFromQueue(
      storeId,
      "STORE_WITH_ERROR_TO_RETRY"
    );

    expect(isRight(storeFromProcessEither)).toBeTruthy();
    expect(isLeft(storeFromProcessEither)).toBeFalsy();

    const storeFromProcess = getRight(storeFromProcessEither);

    expect(storeFromProcess).toMatchObject({
      data: testData,
      name: "store-test-05",
      id: storeId,
    });

    const storeMoveEitherToConsumed = await store.moveQueue(
      storeId,
      "STORE_WITH_ERROR_TO_RETRY",
      "STORE_CONSUMED"
    );

    expect(isRight(storeMoveEitherToConsumed)).toBeTruthy();
    expect(isLeft(storeMoveEitherToConsumed)).toBeFalsy();

    const storeFromConsumedEither = await store.getDataFromQueue(
      storeId,
      "STORE_CONSUMED"
    );

    expect(isRight(storeFromConsumedEither)).toBeTruthy();
    expect(isLeft(storeFromConsumedEither)).toBeFalsy();

    const storeFromConsumed = getRight(storeFromConsumedEither);

    expect(storeFromConsumed).toMatchObject({
      data: testData,
      name: "store-test-05",
      id: storeId,
    });

    const storeFromQueueAfterEither = await store.getDataFromQueue(
      storeId,
      "STORE_TO_CONSUME"
    );

    expect(isRight(storeFromQueueAfterEither)).toBeFalsy();
    expect(isLeft(storeFromQueueAfterEither)).toBeTruthy();

    const storeFromRetryEither = await store.getDataFromQueue(
      storeId,
      "STORE_WITH_ERROR_TO_RETRY"
    );

    expect(isRight(storeFromRetryEither)).toBeFalsy();
    expect(isLeft(storeFromRetryEither)).toBeTruthy();
  });
});
