declare module "node:http" {
  const http: any;
  export default http;
  export type IncomingMessage = any;
  export type ServerResponse = any;
}

declare module "node:process" {
  const process: any;
  export default process;
}

declare const Buffer: any;
declare const process: any;
