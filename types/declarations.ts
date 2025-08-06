export interface RegistrationSearchParams {
  protocolNumber?: string;
  firstPersonName?: string;
  secondPersonName?: string;
  bookNumber?: string;
  pageNumber?: number;
  termNumber?: number;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
