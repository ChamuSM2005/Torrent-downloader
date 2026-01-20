
export interface TorrentStatus {
  id: string;
  name: string;
  progress: number;
  download_speed: number;
  upload_speed: number;
  num_peers: number;
  state: string;
  total_size: number;
  eta: string;
}

export interface SearchResult {
  name: string;
  size: number;
  seeders: number;
  leechers: number;
  magnet: string;
  source: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  SEARCH = 'search',
  SMART_INFO = 'smart_info',
  CREATIVE = 'creative',
  HELP = 'help'
}
