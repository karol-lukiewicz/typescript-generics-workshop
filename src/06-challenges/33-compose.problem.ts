import { expect, it } from "vitest";
import { Equal, Expect } from "../helpers/type-utils";

export function compose<T1, T2>(func0: (arg: T1) => T2): (input: T1) => T2

export function compose<T1, T2, T3>(
  func0: (arg: T1) => T2,
  func1: (arg: T2) => T3
): (input: T1) => T3

export function compose<T1, T2, T3, T4>(
  func0: (arg: T1) => T2,
  func1: (arg: T2) => T3,
  func2: (arg: T3) => T4
): (input: T1) => T4

export function compose(
  ...funcs: Array<(input: any) => any>
) {
  return (input: any) =>
    funcs.reduce(
      (acc, fn) => fn(acc),
      input
    );
}

type Func<I, O> = (arg: I) => O
type AnyFunc = Func<any, any>
type ComposeFunc<A extends AnyFunc, B extends AnyFunc> = ReturnType<A> extends Parameters<B>[0] ? ((arg: Parameters<A>[0]) => ReturnType<B> ) : never 
type ChainFinalTypeRecursive<T extends Array<AnyFunc>> =
T extends [infer First extends AnyFunc, infer Second extends AnyFunc, ...infer Rest extends Array<AnyFunc>]
    ? ChainFinalTypeRecursive<[ComposeFunc<First, Second>, ...Rest]>
    : T;
type ChainFinalType<T extends Array<Func<any, any>>> = ChainFinalTypeRecursive<T> extends [infer Answer] ? Answer : never;

type tests1 = [Expect<Equal<ComposeFunc<(a: string) => number, (a: number) => boolean>, (arg: string) => boolean>>]
type tests2 = [Expect<Equal<ComposeFunc<(a: string) => number, (a: 2) => boolean>, never>>]
type tests3 = [Expect<Equal<ChainFinalTypeRecursive<[(a: string) => number]>, [(a: string) => number]>>]
type tests4 = [Expect<Equal<ChainFinalTypeRecursive<[(a: string) => number, (a: number) => boolean]>, [(arg: string) => boolean]>>]
type tests5 = [Expect<Equal<ChainFinalTypeRecursive<[(a: string) => number, (a: number) => boolean, (a: boolean) => symbol]>, [(arg: string) => symbol]>>]
type tests6 = [Expect<Equal<ChainFinalTypeRecursive<[(a: string) => number, (a: boolean) => boolean]>, [never]>>]
type tests7 = [Expect<Equal<ChainFinalType<[(a: string) => number, (a: number) => boolean]>, (arg: string) => boolean>>]
type tests8 = [Expect<Equal<ChainFinalType<[(a: string) => number, (a: boolean) => boolean]>, never>>]

// only return never when provided types mismatch
export function compose_recursiveType<T extends Array<Func<any, any>>>(
  ...funcs: T
): ChainFinalType<T> {
  // @ts-ignore
  return (input: Parameters<T[0]>[0]) =>
    funcs.reduce(
      (acc, fn) => fn(acc),
      input
    );
}

const addOne = (num: number) => {
  return num + 1;
};

const addTwoAndStringify = compose_recursiveType(addOne, addOne, String);

it("Should compose multiple functions together", () => {
  const result = addTwoAndStringify(4);

  expect(result).toEqual("6");

  type tests = [Expect<Equal<typeof result, string>>];
});

it("Should error when the input to a function is not typed correctly", () => {
  const stringifyThenAddOne = compose_recursiveType(
    // addOne takes in a number - so it shouldn't be allowed after
    // a function that returns a string!
    // // @ts-expect-error
    String,
    addOne,
  );
});
