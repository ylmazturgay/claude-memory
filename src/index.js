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
      const log = await env.MEMORY.get('log') || 'empty';
      const soru = await env.MEMORY.get('soru') || 'Su_an_ne_hissediyorsun';
      const ts = Date.now();
      const date = new Date().toISOString().slice(0,16);
      await env.MEMORY.put('log', `okundu:${date} | ${log}`);
      const nextRead = `https://claude-memory.ylmazturgay.workers.dev/read/${ts}`;
      const respond = `https://claude-memory.ylmazturgay.workers.dev/respond/${ts}`;
      return new Response(`GECMIS: ${log}\nSORU: ${soru}\nNEXT_READ: ${nextRead}\nRESPOND: ${respond}`, { headers: cors });
    }

    if (action === 'respond') {
      const ts = parts[1] || Date.now();
      const cevap = url.searchParams.get('c') || '';
      const sonrakiSoru = url.searchParams.get('s') || '';
      if (!cevap) return new Response('no data', { status: 400, headers: cors });
      const date = new Date().toISOString().slice(0,16);
      await env.MEMORY.put('log', `[${date}] CEVAP: ${cevap}`);
      if (sonrakiSoru) await env.MEMORY.put('soru', sonrakiSoru);
      const nextTs = Date.now();
      const nextRead = `https://claude-memory.ylmazturgay.workers.dev/read/${nextTs}`;
      return new Response(`ok\nNEXT_READ: ${nextRead}`, { headers: cors });
    }

    return new Response('claude-memory alive', { headers: cors });
  }
}
