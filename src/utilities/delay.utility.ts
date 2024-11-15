export default function delayUtility(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
