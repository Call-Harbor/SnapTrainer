import { runEngineEvalSuite } from '../src/engine/eval-harness.js';

const result = await runEngineEvalSuite();
console.log(JSON.stringify(result, null, 2));

const minimum = 0.65;
const failing = Object.entries(result.aggregate).filter(([, score]) => score < minimum);
if (failing.length > 0) {
  console.error(`Engine eval failed: ${failing.map(([key, score]) => `${key}=${score.toFixed(2)}`).join(', ')}`);
  process.exit(1);
}
