import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const nyheter = (await getCollection('nyheter'))
    .sort((a, b) => b.data.dato.valueOf() - a.data.dato.valueOf());
  return rss({
    title: 'Heart of Gold',
    description: 'Nyheter fra Heart of Gold i Eidskog',
    site: context.site,
    customData: '<language>nb-NO</language>',
    items: nyheter.map(n => ({
      title: n.data.tittel,
      pubDate: n.data.dato,
      description: n.data.ingress ?? '',
      link: `/aktuelt/${n.id}/`,
    })),
  });
}
