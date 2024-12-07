export type FunctionResult<Value, Error> =
    | {
          success: false;
          error: Error;
      }
    | {
          success: true;
          value: Value;
      };
