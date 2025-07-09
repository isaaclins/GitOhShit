interface ElectronAPI {
    onMenuOpenRepository: (callback: () => void) => void;
    onMenuCloseRepository: (callback: () => void) => void;
    onMenuViewLinear: (callback: () => void) => void;
    onMenuViewTree: (callback: () => void) => void;
    onMenuViewTimeline: (callback: () => void) => void;
    openRepository: (path: string) => Promise<any>;
    getCommitHistory: (repoPath: string) => Promise<any[]>;
    editCommit: (repoPath: string, commitHash: string, changes: any) => Promise<boolean>;
    selectDirectory: () => Promise<string | null>;
    removeAllListeners: (channel: string) => void;
}
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
export {};
