export type Left<E> = [E, null];
export type Right<T> = [null, T];
export type Either<T> = Left<Error> | Right<T>;

export const left = <E>(value: E): Left<E> => [value, null];
export const right = <T>(value: T): Right<T> => [null, value];

export const isLeft = <T>(value: Either<T>): value is Left<Error> =>
  value[0] !== null;
export const isRight = <T>(value: Either<T>): value is Right<T> =>
  value[1] !== null;

export const getLeft = <T>(value: Either<T>): Error => value[0] as Error;
export const getRight = <T>(value: Either<T>): T => value[1] as T;

export const either = async <T>(promise: Promise<T>): Promise<Either<T>> => {
  try {
    const result = await promise;
    return right(result);
  } catch (error) {
    return left(error as Error);
  }
};
