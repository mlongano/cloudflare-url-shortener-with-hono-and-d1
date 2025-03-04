export class UserAuthException extends Error {
  status: number;

  constructor(message: string, status: number = 404) {
    super(message);
    this.status = status;
    this.name = 'UserAuthException';
  }
}