import { SdkConfig } from "./services/common/types";

/**
 * SDK Main class
 */
export class Ccp {
  /**
   * Constructor.
   *
   * @param config - services configurations
   *
   */

  constructor(config: SdkConfig) {
    if (config.enableLog) {
      require("axios-debug-log/enable");
    }
  }
}
