
export interface DbSchema {
  version: string;
  checksum: number;
  description: string;
  installedBy: string;
  executionTime: number;
  installedOn: Date;
  installedRank: number;
  script: string;
  success: boolean;
  type: string;
}

