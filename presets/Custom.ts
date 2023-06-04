import { stringifyQuery } from '../_stringifyQuery.ts'

export class Custom {
  #clientId
  #clientSecret
  #authorizeUrl
  #tokenUrl

  constructor({
    clientId,
    clientSecret,
    authorizeUrl,
    tokenUrl
  }: {
    clientId: string
    clientSecret: string
    authorizeUrl: string
    tokenUrl: string
  }) {
    this.#clientId = clientId
    this.#clientSecret = clientSecret
    this.#authorizeUrl = authorizeUrl
    this.#tokenUrl = tokenUrl
  }

  getRedirectUrl() {
    return `${this.#authorizeUrl}?${
      stringifyQuery({
        client_id: this.#clientId
      })
    }`
  }

  // deno-lint-ignore no-explicit-any
  async getUser<User = Record<string, any>>(
    url: string,
    token:
      | string
      | {
          token: string
          type?: string
        }
  ): Promise<User> {
    const _token = typeof token == 'string' ? token : token.token
    , _type = typeof token === 'string' ? 'token' : token.type

    , response = await fetch(url, {
      headers: {
        accept: 'application/json',
        authorization: `${_type ?? 'token'} ${_token}`
      }
    })
    
    return await response.json()
  }

  async getAccessToken(code: string): Promise<{
    accessToken: string
    type: string
    [key: string]: unknown
  } | undefined> {
    const response = await fetch(this.#tokenUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: this.#clientId,
        client_secret: this.#clientSecret,
        code
      })
    })

    , result = await response.json()

    return result.error ? undefined : {
      accessToken: result.access_token,
      type: result.token_type
    }
  }
}