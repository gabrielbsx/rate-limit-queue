import { Either, left } from "./either.utility";

export async function match<T>(
  value: string,
  cases: Record<string, () => Promise<Either<T>>>
): Promise<Either<T>> {
  const fn = cases[value];

  if (!fn) {
    return left(new Error("No match found"));
  }

  return await fn();
}
