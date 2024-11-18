import { Plugin, loadPrism } from 'obsidian';
import './styles.css';

export default class ShellSessionSyntaxHighlightPlugin extends Plugin {
	Prism: any;

	async onload() {
		try {
			console.log('Loading Shell-Session Syntax Highlighting Plugin');
			this.Prism = await loadPrism();

			this.Prism.languages['shell-session'] = {
				'folder': {
					pattern: /(\[.*\](?=\$))/m,
					alias: 'folder',
				},
				'command': {
					pattern: /([$#].*)/m,
					inside: {
						'shell-symbol': /[$#]/,
						'language-bash': {
							pattern: /\s(.*)/,
							inside: this.Prism.languages['bash'],
						}
					},
				},
				'output': {
					pattern: /(\n).*/m,
					alias: 'output',
				},
			};

			this.registerMarkdownPostProcessor((el, ctx) => {
				el.querySelectorAll('pre > code.language-shell-session').forEach((block) => {
					this.Prism.highlightElement(block); // Apply Prism highlighting
				})
			})

		} catch (error) {
			console.error('Failed to load Prism: ', error);
		}
	}

	onunload() {
		console.log('Unloading Shell-Session Syntax Highlighting Plugin');
		if (this.Prism && this.Prism.languages['shell-session']) {
			delete this.Prism.languages['shell-session'];
		}
	}

}