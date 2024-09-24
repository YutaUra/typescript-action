import { readFile } from "node:fs/promises";
import * as core from "@actions/core";
import { exec, getExecOutput } from "@actions/exec";

const main = async () => {
  // fix .gitignore
  await exec("sed", ["-i", "-E", "s|^/?dist/?||g", ".gitignore"]);
  // remove unnecessary files
  await exec("rm", "-rf", ".github/workflows");

  const { version } = JSON.parse(await readFile("./package.json", "utf8"));

  // check v{version} tag exists
  const { stdout: tagExists } = await execAsync(`git tag -l v${version}`);
  if (tagExists.trim()) {
    core.info(`v${version} tag already exists`);
    core.info("Skipping release");
    return;
  }

  const setupGitUser = core.getBooleanInput("setupGitUser");

  if (setupGitUser) {
    core.info("setting git user");
    await exec("git", ["config", "user.name", `"github-actions[bot]"`]);
    await exec("git", [
      "config",
      "user.email",
      `"github-actions[bot]@users.noreply.github.com"`,
    ]);
  }

  // commit changes
  await execAsync("git add .");
  await execAsync(`git commit -m "Release v${version}"`);
  await execAsync(`git tag v${version}`);
  console.log(`New tag: v${version}`);
};

main();
