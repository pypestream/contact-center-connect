interface serviceConfig {
  apiKey: string;
  key: string;
}

export interface CspConfig {
  services: [serviceConfig];
}
