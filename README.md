# kwty

## Rastreamento de visitas (gclid)

`src/tracking.js` envia cada visita para `POST /api/track` (função `api/track.js`), que grava na tabela `landing_visits` do MySQL. O botão "Get started" repassa `gclid`, `gbraid` e `wbraid` ao site de destino.

### Configuração

1. Execute `db/migrations/001_create_landing_visits.sql` no banco (opcional: `db/grants.example.sql` cria um usuário restrito).
2. Local: preencha `.env.local`.
3. Produção: cadastre as variáveis de `.env.example` em Vercel → Settings → Environment Variables e faça um novo deploy.

O repositório é público: nunca versione credenciais nem use o prefixo `VITE_` nelas.

### Desenvolvimento

```bash
node ./node_modules/vite/bin/vite.js --host 127.0.0.1
```

### Teste

Abra a página com `?gclid=teste123` e confira:

```sql
SELECT id, gclid, ip_address, currency_code, conversion_value, created_at FROM landing_visits ORDER BY id DESC LIMIT 10;
```

## aviso
