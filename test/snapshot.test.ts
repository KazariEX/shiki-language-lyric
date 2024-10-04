import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHighlighterCore, createOnigurumaEngine } from "shiki";
import theme from "shiki/themes/one-dark-pro.mjs";
import { expect, it } from "vitest";
import grammar from "../src";

const baseDir = fileURLToPath(new URL("../samples", import.meta.url));

it(grammar.name, async () => {
    const highlighter = await createHighlighterCore({
        themes: [theme],
        langs: [grammar],
        engine: createOnigurumaEngine(() => import("@shikijs/core/wasm-inlined"))
    });

    try {
        const path = join(baseDir, "lyric.sample");
        const sample = await readFile(path, "utf-8");

        await expect(
            highlighter
                .codeToTokensBase(sample, { lang: grammar.name, theme: "one-dark-pro" })
                .flat()
                .map((i) => (i.color || "").padEnd(15, " ") + i.content)
                .join("\n")
        ).toMatchFileSnapshot(`./__snapshots__/${grammar.name}.txt`);
    }
    finally {
        highlighter.dispose();
    }
});