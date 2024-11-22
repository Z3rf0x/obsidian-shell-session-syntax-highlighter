import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, PluginValue, ViewUpdate } from "@codemirror/view";
import loadPrismShellSession from "loadPrismShellSession";

export default class ShellSessionHighlight implements PluginValue {
    decorations: DecorationSet;
    Prism: any;

    constructor(view: EditorView) {
        this.decorations = Decoration.none;
        this.loadPrism().then(() => {
            this.decorations = this.buildDecorations(view);
            view.update([]);
        });
    }

    async loadPrism() {
        this.Prism = await loadPrismShellSession();
    }

    update(update: ViewUpdate): void {
        if (update.viewportChanged || update.docChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();

        if (!this.Prism)
            return Decoration.none;

        const text = view.state.doc.toString();
        const shell_regex = /```shell-session(?:[\s:!?.;,@%&(){}[\]<>*~]*)([\s\S]*?)```/gi
        const powershell_regex = /```powershell-session(?:[\s:!?.;,@%&(){}[\]<>*~]*)([\s\S]*?)```/gi
        const msf_regex = /```msf-session(?:[\s:!?.;,@%&(){}[\]<>*~]*)([\s\S]*?)```/gi

        const matches: { blockStart: number; codeBlock: string; language: string }[] = [];

        let match;
        while ((match = shell_regex.exec(text)) !== null) {
            matches.push({
                blockStart: match.index,
                codeBlock: match[0],
                language: "shell-session",
            });
        }

        while ((match = powershell_regex.exec(text)) !== null) {
            matches.push({
                blockStart: match.index,
                codeBlock: match[0],
                language: "powershell-session",
            });
        }

        while ((match = msf_regex.exec(text)) !== null) {
            matches.push({
                blockStart: match.index,
                codeBlock: match[0],
                language: "msf-session",
            });
        }

        matches.sort((a, b) => a.blockStart - b.blockStart);

        for (const { blockStart, codeBlock, language } of matches) {
            const highlighted = this.Prism.highlight(codeBlock, this.Prism.languages[language], language);
            this.highlight(highlighted, blockStart, builder);
        }

        return builder.finish();
    }

    highlight(highlighted: string, blockStart: number, builder: RangeSetBuilder<Decoration>) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(highlighted, "text/html");
        const tempEl = doc.body;

        let currentIndex = blockStart;

        const ranges: { start: number, end: number, className: string }[] = [];

        const traverse = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                currentIndex += (node.textContent || "").length;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const className = element.className;

                const start = currentIndex;
                element.childNodes.forEach((child) => {
                    traverse(child);
                });

                const end = currentIndex;

                ranges.push({ start, end, className });
            }
        };

        tempEl.childNodes.forEach((child) => {
            traverse(child);
        });
        console.log(ranges)
        ranges.sort((a, b) => a.start - b.start);
        console.log(ranges)

        for (const range of ranges) {
            builder.add(range.start, range.end, Decoration.mark({ class: range.className }));
        }
    }
}