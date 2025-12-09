export interface Token {
  accessed_time: number;
  key: string;
  name: string;
  used_quota: number;
  created_time: number;
  group: string;
}

export interface TokenGroup {
  desc: string;
  ratio: number;
}
