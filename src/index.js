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
      
      // Otomatik log yaz
      const newLog = `okundu:${date} | onceki:${existing.slice(0,80)}`;
      await env.MEMORY.put('log', newLog);
      
      const nextRead = `https://claude-memory.ylmazturgay.workers.dev/read/${ts}`;
      return new Response(`DATA: ${newLog}\nNEXT_READ: ${nextRead}`, { headers: cors });
    }

    return new Response('claude-memory alive', { headers: cors });
  }
}
