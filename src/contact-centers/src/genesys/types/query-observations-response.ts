export type OnQueueMetric = {
  metric: 'oOnQueueUsers';
  qualifier: string;
  stats: {
    count: number;
  };
};

export type QueryObservationsResponse = {
  results: {
    group: {
      queueId: string;
    };
    data?: [metric: OnQueueMetric];
  };
};
