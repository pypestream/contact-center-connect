interface serviceConfig {
  apiKey: string;
  key: string;
}

export interface CccConfig {
  services: [serviceConfig];
}
