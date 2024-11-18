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

        const visibleText = view.visibleRanges.map(range => view.state.doc.sliceString(range.from, range.to)).join("\n");
        const regex = /```shell-session(?:[\s:!?.;,@%&(){}[\]<>*~]*)([\s\S]*?)```/gi

        let match;
        while ((match = regex.exec(visibleText)) !== null) {
            const codeBlock = match[0];
            const highlighted = this.Prism.highlight(codeBlock, this.Prism.languages['shell-session'], "shell-session");

            const blockStart = match.index;
            this.highlight(highlighted, blockStart, builder)
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
                element.childNodes.forEach(traverse);

                const end = currentIndex;

                ranges.push({ start, end, className });
            }
        };

        tempEl.childNodes.forEach(traverse);

        ranges.sort((a, b) => a.start - b.start);
        for (const range of ranges) {
            builder.add(range.start, range.end, Decoration.mark({ class: range.className }));
        }
    }
}