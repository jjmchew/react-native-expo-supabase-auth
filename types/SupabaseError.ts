/*

Example error data:

{"code": "23514", "details": null, "hint": null, "message": "new row for relation \"profiles\" violates check constraint \"username_length\""}

*/

export interface SupabaseErrorData {
  code: string;
  details?: any;
  hint?: any;
  message: string;
}

export class SupabaseError extends Error {
  public data: SupabaseErrorData;

  constructor(message: string, data: SupabaseErrorData) {
    super(message);
    this.data = data;
    this.name = "SupabaseError";

    Object.setPrototypeOf(this, SupabaseError.prototype);
  }
}

export function isSupabaseErrorData(obj: unknown): obj is SupabaseErrorData {
  if (typeof obj !== "object" || obj === null) return false;

  const partialObj = obj as Partial<SupabaseErrorData>;

  return (
    typeof partialObj.code === "string" &&
    typeof partialObj.message === "string"
  );
}
