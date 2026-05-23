export interface TodayFile {
  path: string;
  name: string;
  modifiedMs: number;
}

export interface FileEntry {
  path: string;
  name: string;
  isDir: boolean;
  children?: FileEntry[];
}

