export interface IUser {
  id: string;
  email: string;
  name: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}
