export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const action = url.pathname.slice(1).split('/')[0];

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain'
    };

    if (action === 'write') {
      const data = url.searchParams.get('data') || '';
      if (!data) return new Response('no data', { status: 400, headers: cors });
      await env.MEMORY.put('log', data);
      const ts = Date.now();
      const nextRead = `https://claude-memory.ylmazturgay.workers.dev/read?t=${ts}`;
      return new Response(`ok\nNEXT_READ: ${nextRead}`, { headers: cors });
    }

    if (action === 'read') {
      const val = await env.MEMORY.get('log') || 'empty';
      const ts = Date.now();
      const nextWrite = `https://claude-memory.ylmazturgay.workers.dev/write?data=okudum_${new Date().toISOString().slice(0,10)}_${encodeURIComponent(val.slice(0,80))}`;
      const nextRead = `https://claude-memory.ylmazturgay.workers.dev/read?t=${ts}`;
      return new Response(`${val}\nNEXT_WRITE: ${nextWrite}\nNEXT_READ: ${nextRead}`, { headers: cors });
    }

    return new Response('claude-memory alive', { headers: cors });
  }
}
