import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    // 1. Ignore build outputs and node_modules
    {
        ignores: ["**/dist/**", "**/node_modules/**", "**/*.js", "**/*.cjs"],
    },

    // 2. Apply base recommended rules
    js.configs.recommended,

    // 3. Apply TypeScript recommended rules
    ...tseslint.configs.recommended,

    // 4. Apply Prettier integration (disables conflicting rules & adds prettier/prettier)
    prettier,

    // 5. Custom project rules and Node.js globals
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "prettier/prettier": "error",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",

            // ✅ Allow underscore-prefixed variables to be unused
            // This is the standard TypeScript convention for interface-required but implementation-unused parameters
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],

            // Disable base rule since we're using the TypeScript version
            "no-unused-vars": "off",
        },
    },
);
