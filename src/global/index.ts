import { Control, application } from '@ijstech/components';
import { ILinkPreview, IPostData } from './interface';

export * from './utils';
export * from './interface';

export const MAX_HEIGHT = 352;

export const getEmbedElement = async (postData: IPostData, parent: Control, callback?: any) => {
  const { module, data } = postData;
  const elm = await application.createElement(module, true) as any;
  if (!elm) throw new Error('not found');
  elm.parent = parent;
  if (elm.ready) await elm.ready();
  const builderTarget = elm.getConfigurators ? elm.getConfigurators().find((conf: any) => conf.target === 'Builders' || conf.target === 'Editor') : null;
  elm.maxWidth = '100%';
  elm.maxHeight = '100%';
  if (builderTarget?.setData && data.properties) {
    await builderTarget.setData(data.properties);
  }
  const { dark, light } = data.properties || {};
  let tag = {};
  const darkTheme = getThemeValues(dark);
  const lightTheme = getThemeValues(light);
  if (darkTheme) {
    tag['dark'] = darkTheme;
  }
  if (lightTheme) {
    tag['light'] = lightTheme;
  }
  tag = { ...tag, ...data.tag };
  if (builderTarget?.setTag && Object.keys(tag).length) {
    await builderTarget.setTag(tag);
  }
  application.EventBus.dispatch('POST_CREATED_EMBED_ELEMENT', { module, elm });
  if (callback) callback(elm);
  return elm;
}

const getThemeValues = (theme: any) => {
  if (!theme || typeof theme !== 'object') return null;
  let values = {};
  for (let prop in theme) {
    if (theme[prop]) values[prop] = theme[prop];
  }
  return Object.keys(values).length ? values : null;
}

export const getLinkPreview = async (apiBaseUrl: string, url: string): Promise<ILinkPreview | undefined> => {
  try {
    if (!apiBaseUrl.endsWith('/')) apiBaseUrl += '/';
    const response = await fetch(`${apiBaseUrl}preview?url=${encodeURI(url)}`);
    const result = await response.json();
    return {
      url,
      ...result
    }
  } catch (err) {}
}

export const getDomain = (url: string) => {
  try {
    return new URL(url.toLowerCase()).hostname;
  } catch (err) {
    return url;
  }
}