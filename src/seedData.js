/* @flow */

export default async function seedData(client, index, type, data) {
  await client.bulk({
    body: prepareBulkBody(index, type, data),
  });
}

function prepareBulkBody(index, type, data) {
  const body = [];
  data.forEach(doc => {
    const { id } = doc;
    body.push({ index: { _index: index, _type: type, _id: id } });
    delete doc.id; // eslint-disable-line no-param-reassign
    body.push(doc);
  });
  return body;
}
