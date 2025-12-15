export type CCSwitchApp = 'claude' | 'codex' | 'gemini';

export interface CCSwitchExportParams {
  app: CCSwitchApp;
  name: string;
  baseUrl: string;
  tokenKey: string;
}

export function buildCCSwitchDeeplink(params: CCSwitchExportParams): string {
  const { app, name, baseUrl, tokenKey } = params;
  const endpoint = app === 'codex' ? `${baseUrl}/v1` : baseUrl;
  const apiKey = `sk-${tokenKey}`;

  const url = new URL('ccswitch://v1/import');
  url.searchParams.set('resource', 'provider');
  url.searchParams.set('app', app);
  url.searchParams.set('name', name);
  url.searchParams.set('homepage', baseUrl);
  url.searchParams.set('endpoint', endpoint);
  url.searchParams.set('apiKey', apiKey);

  return url.toString();
}
