import { loadPrism } from "obsidian"


const SHELL_SESSION_GRAMMAR = {
    'folder': {
        pattern: /(\[.*\](?=\$))/m,
        alias: 'success',
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
        alias: "text"
    },
    'output': {
        pattern: /(\n).*/m,
        alias: 'text'
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
        alias: "text"
    },
    'output': {
        pattern: /(\n).*/m,
        alias: 'text',
    },
}

const MSF_SESSION_GRAMMAR = {
    'msf':{
        pattern: /(\b(?:msf6|msf)(?=\s|\]))/m,
        alias: 'success'
    },
    'jobs&agents':{
        pattern: /(?<=\]\()[^)]*/m,
        inside: {
            'jobs': /Jobs/,
            'agents': /Agents/,
        }
    },
    'module': {
        pattern: /exploit\(([^]+)\)/m,
        inside: {
            'high': {
                pattern: /(?<=\().*(?=\))/,
            }
        }
    },
    'output': {
        pattern: /(\n).*/m,
        alias: 'text',
    },
}

const loadPrismShellSession = async () => {
    try {
        const Prism = await loadPrism();
        SHELL_SESSION_GRAMMAR.command.inside['language-bash'].inside = Prism.languages['bash'];
        Prism.languages['shell-session'] = SHELL_SESSION_GRAMMAR;
        POWERSHELL_SESSION_GRAMMAR.command.inside['language-powershell'].inside = Prism.languages['powershell'];
        Prism.languages['powershell-session'] = POWERSHELL_SESSION_GRAMMAR;
        Prism.languages['msf-session'] = MSF_SESSION_GRAMMAR;
        return Prism;
    } catch (error) {
        console.error("Failed to load Prism:", error);
        throw error;
    }
}


export default loadPrismShellSession;