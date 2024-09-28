// src/main.ts
import "source-map-support/register.js";
import * as core2 from "@actions/core";

// src/run.ts
import * as core from "@actions/core";
var run = async (inputs) => {
  core.info(`my name is ${inputs.name}`);
};

// src/main.ts
var main = async () => {
  await run({
    name: core2.getInput("name", { required: true })
  });
};
main().catch((e) => {
  core2.setFailed(e);
  console.error(e);
});
//# sourceMappingURL=main.js.map