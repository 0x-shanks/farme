import { MetadataRoute } from 'next';
import { siteOrigin } from './constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/frames/*']
    },
    sitemap: `${siteOrigin}/sitemap.xml`
  };
}
