#!/usr/bin/env node
// PreToolUse hook: block edits that introduce `asChild=` in .tsx/.jsx/.ts/.js files.
// Base UI (used by this project) doesn't support asChild; use render={<Component/>} instead.

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    const tool = data.tool_name;
    if (tool !== "Edit" && tool !== "Write" && tool !== "MultiEdit") return;

    const filePath = data.tool_input?.file_path || "";
    if (!/\.(tsx|jsx|ts|js)$/.test(filePath)) return;

    const chunks = [];
    if (data.tool_input?.new_string) chunks.push(data.tool_input.new_string);
    if (data.tool_input?.content) chunks.push(data.tool_input.content);
    if (Array.isArray(data.tool_input?.edits)) {
      for (const e of data.tool_input.edits) {
        if (e?.new_string) chunks.push(e.new_string);
      }
    }
    const candidate = chunks.join("\n");
    if (!candidate) return;

    // Match actual JSX attribute usage, not comments or prose mentioning it.
    // Only trigger when asChild is followed by:
    //   = (assignment: asChild={true} / asChild="...")
    //   /> or > (self-closing boolean: <Foo asChild /> or <Foo asChild>)
    //   } (end of inline expression)
    if (/\basChild\s*(?:=|\/?>|})/.test(candidate)) {
      console.log(
        JSON.stringify({
          decision: "block",
          reason:
            "This project uses @base-ui/react (via shadcn base-nova style), which does not support the `asChild` prop. Use `render={<Component/>}` on the parent (Button, DialogTrigger, DropdownMenuTrigger, etc.). When the rendered element is not a native <button> (e.g. Link, <a>), also pass `nativeButton={false}`. See CLAUDE.md → Base UI conventions.",
        }),
      );
    }
  } catch {
    // swallow parse errors — don't break tool use on hook error
  }
});
