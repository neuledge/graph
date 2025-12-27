#!/usr/bin/env node

const [, , command, ...args] = process.argv;

const NEULEDGE_API_BASE_URL = "https://api.graph.neuledge.com/v1";

(async () => {
  try {
    switch (command) {
      case "sign-up": {
        const email = args[0];
        if (!email) {
          console.error("Usage: sign-up <email>");
          process.exit(1);
        }

        console.log("Signing up…");

        const result = await signUp(email);

        console.log("✅ Signed up successfully");
        if (result?.message) {
          console.log(result.message);
        }

        break;
      }

      case undefined:
      case "help":
        printHelp();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    console.error("❌", err.message);
    process.exit(1);
  }
})();

function printHelp() {
  console.log(`
Usage:
  graph sign-up <email>

Commands:
  sign-up    Register an email
  help       Showing this message

Examples:
  graph sign-up your@email.com
`);
}

async function signUp(email) {
  if (!email.includes("@")) {
    throw new TypeError("Invalid email address");
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 10_000);

  const res = await fetch(`${NEULEDGE_API_BASE_URL}/cli/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
    abort: controller.signal,
  }).catch(() => {
    throw new Error("Error while accessing the server");
  });

  if (!res.ok) {
    const text = await res
      .json()
      .then((body) => {
        const message = body?.error?.message;
        if (!message) {
          throw new Error("Invalid error format");
        }

        return message;
      })
      .catch(() => res.text());
    throw new Error(`Sign-up failed (${res.status}): ${text}`);
  }

  return res.json();
}
