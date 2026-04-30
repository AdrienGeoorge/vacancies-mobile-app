let _token: string | null = null

export const tokenStorage = {
  get: () => _token,
  set: (token: string | null) => { _token = token },
}
