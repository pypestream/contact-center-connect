interface serviceConfig {
  apiKey: string;
  key: string;
}

export interface CcpConfig {
  services: [serviceConfig];
}
