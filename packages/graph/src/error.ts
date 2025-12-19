export interface NeuledgeError {
  message: string;
}

class NeuledgeErrorImpl extends Error implements NeuledgeError {
  constructor(message: string) {
    super(message);
    this.name = "NeuledgeError";

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, NeuledgeError.prototype);
  }

  static from(error: NeuledgeError | unknown): NeuledgeError {
    if (error instanceof NeuledgeError) {
      return error;
    }

    const message = String((error as NeuledgeError)?.message || error);
    const neuledgeError = new NeuledgeError(message);

    // Preserve the original stack trace if available
    const stack = (error as Error)?.stack;
    if (stack) neuledgeError.stack = stack;

    return neuledgeError;
  }
}

export const NeuledgeError = NeuledgeErrorImpl;
