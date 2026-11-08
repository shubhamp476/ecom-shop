export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface FieldIssue {
  field: string;
  message: string;
}

/** Input validation failure, rendered as HTTP 422 with per-field details. */
export class ValidationError extends Error {
  constructor(public issues: FieldIssue[]) {
    super(issues.map((i) => i.message).join("; "));
  }
  static single(message: string, field = "") {
    return new ValidationError([{ field, message }]);
  }
}
