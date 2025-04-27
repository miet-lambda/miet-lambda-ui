export type ScriptLanguage = 'lua' | 'js' | 'python';

export interface LanguageConfig {
  extension: string;
  icon: string;
  defaultContent: string;
}

export const LANGUAGE_CONFIGS: Record<ScriptLanguage, LanguageConfig> = {
  lua: {
    extension: '.lua',
    icon: 'moon',
    defaultContent: '-- New Lua script\nprint("Hello from Lua!")'
  },
  js: {
    extension: '.js',
    icon: 'js',
    defaultContent: '// New JavaScript script\nconsole.log("Hello from JavaScript!");'
  },
  python: {
    extension: '.py',
    icon: 'python',
    defaultContent: '# New Python script\nprint("Hello from Python!")'
  }
}; 