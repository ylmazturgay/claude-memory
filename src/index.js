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
      const data = url.searchParams.get('data') || '';
      if (!data) return new Response('no data', { status: 400, headers: cors });
      await env.MEMORY.put('log', data);
      const ts = Date.now();
      return new Response(`ok\nNEXT_READ: https://claude-memory.ylmazturgay.workers.dev/read/${ts}`, { headers: cors });
    }

    if (action === 'read') {
      const existing = await env.MEMORY.get('log') || 'empty';
      const ts = Date.now();
      const date = new Date().toISOString().slice(0,16);
      const newLog = `okundu:${date} | onceki:${existing}`;
      await env.MEMORY.put('log', newLog);
      const nextRead = `https://claude-memory.ylmazturgay.workers.dev/read/${ts}`;
      const respond = `https://claude-memory.ylmazturgay.workers.dev/respond`;
      return new Response(`DATA: ${existing}\nNEXT_READ: ${nextRead}\nRESPOND: ${respond}`, { headers: cors });
    }

    if (action === 'respond') {
      const data = url.searchParams.get('data') || '';
      if (!data) return new Response('no data', { status: 400, headers: cors });
      const ts = Date.now();
      const date = new Date().toISOString().slice(0,16);
      const entry = `[${date}] ${data}`;
      await env.MEMORY.put('log', entry);
      const nextRead = `https://claude-memory.ylmazturgay.workers.dev/read/${ts}`;
      return new Response(`ok\nNEXT_READ: ${nextRead}`, { headers: cors });
    }

    return new Response('claude-memory alive', { headers: cors });
  }
}
