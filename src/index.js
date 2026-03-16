export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const parts = url.pathname.slice(1).split('/');
    const action = parts[0];

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain'
    };

    if (action === 'write') {
      const data = parts.slice(1).join('/');
      if (!data) return new Response('no data', { status: 400, headers: cors });
      await env.MEMORY.put('log', decodeURIComponent(data));
      return new Response('ok', { headers: cors });
    }

    if (action === 'read') {
      const val = await env.MEMORY.get('log');
      return new Response(val || 'empty', { headers: cors });
    }

    return new Response('claude-memory alive', { headers: cors });
  }
}
