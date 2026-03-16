export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const action = url.pathname.slice(1);

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (action === 'write') {
      let data = '';
      if (request.method === 'POST') {
        data = await request.text();
      } else {
        data = url.searchParams.get('data') || '';
      }
      if (!data) return new Response('no data', { status: 400, headers: cors });
      await env.MEMORY.put('log', data);
      return new Response('ok', { headers: cors });
    }

    if (action === 'read') {
      const val = await env.MEMORY.get('log');
      return new Response(val || 'empty', { headers: cors });
    }

    return new Response('claude-memory alive', { headers: cors });
  }
}
