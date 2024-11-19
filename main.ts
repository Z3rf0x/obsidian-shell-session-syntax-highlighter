import { Plugin } from 'obsidian';
import './styles.css';
import { ViewPlugin } from '@codemirror/view';
import ShellSessionHighlight from 'ShellSessionHighlight';
import loadPrismShellSession from 'loadPrismShellSession';

export default class ShellSessionSyntaxHighlightPlugin extends Plugin {
	Prism: any;

	async onload() {
		try {
			console.log('Loading Shell-Session Syntax Highlighting Plugin');
			this.Prism = await loadPrismShellSession();

			this.registerMarkdownPostProcessor((el, ctx) => {
				el.querySelectorAll('pre > code.language-shell-session').forEach((block) => {
					this.Prism.highlightElement(block);
				})
				el.querySelectorAll('pre > code.language-powershell-session').forEach((block) => {
					this.Prism.highlightElement(block);
				})
			})

			this.registerEditorExtension(
				ViewPlugin.fromClass(
					ShellSessionHighlight, {
					decorations: (plugin) => plugin.decorations,
				}
				)
			);

			this.app.workspace.updateOptions();
		} catch (error) {
			console.error('Failed to load Prism: ', error);
		}
	}

	onunload() {
		console.log('Unloading Shell-Session Syntax Highlighting Plugin');
		if (this.Prism && this.Prism.languages['shell-session']) {
			delete this.Prism.languages['shell-session'];
			delete this.Prism.languages['powershell-session'];
		}
	}

}