const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: true });

function transformEntry(entry) {
    try {
        const title = entry.title?.[0] || '';
        const link = entry.link?.[0] || '';
        const description = entry.description?.[0] || '';
        const pubDate = entry.pubDate?.[0] ? new Date(entry.pubDate[0]) : null;
        const category = entry.category?.[0] || '';

        return { title, link, description, pubDate, category };
    } catch (err) {
        console.error('Error transforming entry:', err.message);
        return null;
    }
}

async function parseXML(xmlData) {
    const result = await parser.parseStringPromise(xmlData);

    //This will print full structure - study this carefully
    console.log('=== Raw parsed structure (First Item only) ===');
    const firstItem = result?.res?.channel?.[0]?.item?.[0];
    console.log(JSON.stringify(firstItem, null, 2));
    console.log('=============================================');

    const entries = result?.rss?.channel?.[0]?.item || [];
    console.log(`Total entries found: ${entries.length}`);

    const transformed = entries.map(transformEntry).filter(Boolean);
    return transformed;
}

module.exports = { parseXML };