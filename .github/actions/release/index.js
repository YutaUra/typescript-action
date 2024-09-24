import { readFile } from "node:fs/promises";
import * as core from "@actions/core";
import { exec, getExecOutput } from "@actions/exec";

const main = async () => {
  // fix .gitignore
  await exec("sed", ["-i", "-E", "s|^/?dist/?||g", ".gitignore"]);
  // remove unnecessary files
  await exec("rm", "-rf", ".github/workflows");
  await exec("git", ["status"])

  const { version } = JSON.parse(await readFile("./package.json", "utf8"));

  // check v{version} tag exists
  const { stdout: tagExists } = await getExecOutput("git", [
    "tag",
    "-l",
    `v${version}`,
  ]);

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
  await exec("git", ["add", "."]);
  await exec("git", ["commit", "-m", "Release v${version}"]);
  await exec("git", ["tag", `v${version}`]);
  console.log(`New tag: v${version}`);
};

main().catch((error) => core.setFailed(error));
