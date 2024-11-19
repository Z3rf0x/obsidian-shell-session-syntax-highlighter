import { loadPrism } from "obsidian"


const SHELL_SESSION_GRAMMAR = {
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
                inside: null,
            }
        },
    },
    'output': {
        pattern: /(\n).*/m,
        alias: 'output',
    },
};

const POWERSHELL_SESSION_GRAMMAR = {
    'command': {
        pattern: /([>].*)/m,
        inside: {
            'shell-symbol': /^[>]/,
            'language-powershell': {
                pattern: /\s(.*)/,
                inside: null,
            }
        },
    },
    'output': {
        pattern: /(\n).*/m,
        alias: 'output',
    },
}

const loadPrismShellSession = async () => {
    try {
        const Prism = await loadPrism();
        SHELL_SESSION_GRAMMAR.command.inside['language-bash'].inside = Prism.languages['bash'];
        Prism.languages['shell-session'] = SHELL_SESSION_GRAMMAR;
        POWERSHELL_SESSION_GRAMMAR.command.inside['language-powershell'].inside = Prism.languages['powershell'];
        Prism.languages['powershell-session'] = POWERSHELL_SESSION_GRAMMAR;
        return Prism;
    } catch (error) {
        console.error("Failed to load Prism:", error);
        throw error;
    }
}


export default loadPrismShellSession;