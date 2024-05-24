import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { languageOptions: { globals: { ...globals.node, __dirname: true, module: true } } },
  pluginJs.configs.recommended,
];
