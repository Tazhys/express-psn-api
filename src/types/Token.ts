export interface Token {
  Token: string;
  ExpiresIn: number;
}

export interface Tokens {
  Access: Token;
  Refresh: Token;
}

