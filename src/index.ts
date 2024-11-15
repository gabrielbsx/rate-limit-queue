import { faker } from "@faker-js/faker";
import { resultType } from "./enums/result.enum";
import { loopConsume } from "./implementations/consumer.impl";
import StoreImpl from "./implementations/store.impl";

console.log("rate limit queue");

const store = new StoreImpl();

store.addToConsume({
  name: "test",
  data: {
    name: "John Doe",
    age: 25,
  },
});

const _1_minute = 60 * 1000;

loopConsume({
  delayAfterBatch: _1_minute,
  delayBetweenTasks: 1,
  minWaitTimeExceededRateLimit: 10,
  parallel: 4,
  store,
  fn: async (data) => {
    const randomError10Percent = faker.number.int({
      min: 1,
      max: 10,
    });

    if (randomError10Percent === 1) {
      console.log(`Consuming error data: ${JSON.stringify(data)}`);

      return resultType.ERROR;
    }

    console.log(`Consuming data: ${JSON.stringify(data)}`);

    return resultType.OK;
  },
});

for (const i of Array(100).keys()) {
  store.addToConsume({
    name: "test",
    data: {
      id: i,
      name: faker.internet.displayName(),
      age: faker.number.int({
        min: 18,
        max: 60,
      }),
    },
  });
}
