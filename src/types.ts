export interface Script {
  id: string;
  name: string;
  code: string;
  urlPath?: string;
  memoryLimit?: number;
  timeout?: number;
} 