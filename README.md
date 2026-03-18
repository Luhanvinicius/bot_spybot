# 🕵️ Spy Bot - Galaxy Life

O Spy Bot é um bot avançado do Discord desenvolvido para monitorar guerras, rastrear jogadores e analisar estatísticas de alianças no jogo **Galaxy Life**, utilizando a sua API oficial em tempo real.

## 🚀 Funcionalidades

- **Monitor Automático de Guerras:** Detecta quando uma aliança entra em guerra, atualiza os pontos e notifica os resultados.
- **Rastreamento de Jogadores:** Salva o histórico de quais alianças os jogadores visitam.
- **Comandos Completos:** Informações detalhadas de jogadores (`/info_jugador`), alianças (`/alianza`), histórico de guerras e cálculos estratégicos (`/maxfarm`, `/mains`, `/matchmaking`).
- **Sistema de Coordenadas:** Salva e recupera coordenadas de colônias dos jogadores.
- **Geração Visual:** Gera imagens do status da guerra em tempo real.

---

## 🛠️ Guia de Instalação no Ubuntu Server (com PostgreSQL)

Estes passos explicam como instalar e executar o Spy Bot em um servidor Ubuntu usando o **PostgreSQL** como banco de dados principal.

### 1. Preparar o Servidor Ubuntu

Primeiro, atualize os pacotes do sistema e instale o Node.js, npm e o PostgreSQL:

```bash
sudo apt update && sudo apt upgrade -y
# Instalar Node.js (versão 20x recomendada)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

### 2. Configurar o Banco de Dados PostgreSQL

Acesse o console do PostgreSQL para criar o banco de dados e o usuário:

```bash
sudo -u postgres psql
```

Dentro do psql, execute os seguintes comandos:

```sql
CREATE DATABASE spy_bot;
CREATE USER spybotuser WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE spy_bot TO spybotuser;
\c spy_bot
GRANT ALL ON SCHEMA public TO spybotuser;
\q
```

### 3. Clonar e Preparar o Projeto

Envie os arquivos do seu projeto para o servidor (você pode usar git, scp, ou FTP). Vá até a pasta do projeto e instale as dependências.

```bash
cd /caminho/para/o/seu/spy-bot
npm install
```

*(Nota: O projeto já está configurado nativamente com o pacote `pg` e o arquivo `src/database/db.js` já está adaptado para inicializar tudo sozinho no PostgreSQL!)*

### 4. Configurar as Variáveis de Ambiente

Renomeie ou crie o arquivo `.env` na raiz do projeto:

```env
DISCORD_TOKEN=seu_token_do_discord
CLIENT_ID=seu_client_id
GUILD_ID=o_id_do_seu_servidor (opcional, mas recomendado para registrar comandos instantaneamente)

# Configuração do PostgreSQL
DB_HOST=127.0.0.1
DB_USER=spybotuser
DB_PASS=sua_senha_segura
DB_NAME=spy_bot
DB_PORT=5432

API_URL=https://api.galaxylifegame.net
```

### 5. Configurar os Canais do Discord

Edite o arquivo `config.json` e coloque os IDs reais dos canais do seu servidor Discord para onde o bot enviará os alertas automáticos:

```json
{
  "token": "YOUR_DISCORD_TOKEN",
  "api": "https://api.galaxylifegame.net",
  "name": "Spy Bot",
  "updateIntervals": {
    "war": 10000,
    "points": 60000,
    "image": 15000
  },
  "channels": {
    "warStatus": "ID_DO_CANAL",
    "warLive": "ID_DO_CANAL",
    "warHistory": "ID_DO_CANAL",
    "opponent": "ID_DO_CANAL",
    "wpGained": "ID_DO_CANAL",
    "logs": "ID_DO_CANAL"
  }
}
```

### 6. Registrar Comandos Slash no Discord

Antes de iniciar o bot, registre os comandos para que apareçam no seu servidor:

```bash
node deploy-commands.js
```

### 7. Manter o Bot Online 24/7 (via PM2)

Para garantir que o bot continue rodando mesmo se você fechar o terminal SSH, utilize o `pm2`:

```bash
# Instalar o PM2 globalmente
sudo npm install pm2 -g

# Iniciar o bot
pm2 start src/index.js --name "spy-bot"

# Fazer o bot iniciar automaticamente caso o servidor Ubuntu seja reiniciado
pm2 startup
pm2 save
```

Para ver os logs (eventos) em tempo real do bot rodando na nuvem:
```bash
pm2 logs spy-bot
```

---

## 🏗️ Esquema de Tabelas (PostgreSQL)

*(Opcional: o próprio bot tenta criar as tabelas ao iniciar via db.js, mas se quiser criá-las manualmente por segurança, o esquema é este:)*

```sql
CREATE TABLE IF NOT EXISTS alliances_to_shield (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    guild_id VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS war_history (
    id SERIAL PRIMARY KEY,
    alliance_name VARCHAR(255),
    opponent_name VARCHAR(255),
    points_alliance INTEGER,
    points_opponent INTEGER,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    result VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS player_movements (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(255),
    alliance_name VARCHAR(255),
    type VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_coords (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(255) UNIQUE NOT NULL,
    coords TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Divirta-se dominando a galáxia! 🌌
