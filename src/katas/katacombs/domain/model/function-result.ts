export type FunctionResult<Error, Value> =
    | {
          success: false;
          error: Error;
      }
    | {
          success: true;
          value: Value;
      };
