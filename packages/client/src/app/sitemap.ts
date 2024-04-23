import { MetadataRoute } from 'next';
import { siteOrigin } from './constants';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteOrigin,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1
    }
  ];
}
