declare module "react-server-dom-turbopack/server" {
  export function decodeReply<T = unknown>(...args: unknown[]): Promise<T>
  export function registerClientReference<T>(reference: T, moduleId: string, exportName: string): T
}
