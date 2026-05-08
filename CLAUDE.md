# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Sistema de gestão de ordens de serviço para oficina mecânica. Permite registrar veículos, donos e ordens de serviço, controlar estoque de peças, consultar histórico de manutenções e exportar dados.

## Stack

- **Frontend:** Next.js (React) com TypeScript e Tailwind CSS
- **Backend:** Spring Boot (Java)

## Casos de Uso

- **Dashboard** — visão geral das manutenções do mês (página inicial)
- **Ordens de serviço** — CRUD completo; campos: ID, categoria, data, placa, KM, descrição, peças empregadas, observações
- **Veículos** — CRUD completo; campos: ID, placa, ano, modelo, versão, dono
- **Donos** — CRUD completo; campos: nome, idade, CPF
- **Estoque de peças** — controle de entradas (compra) e saídas (uso em OS)
- **Histórico de serviços** — listagem de todos os serviços prestados
- **Busca** — filtros por data, placa, dono e categoria
- **Autenticação** — perfis ADMIN e usuário geral
- **Export CSV** — exportação do histórico de manutenções

## Modelo de Dados e Relacionamentos

- **Dono → Veículo:** 1 dono pode ter vários veículos; 1 veículo pertence a apenas 1 dono.
- **Veículo → Manutenção:** 1 veículo pode ter várias manutenções; 1 manutenção pertence a apenas 1 veículo.
- **Cascade delete:** a deleção de um Dono deve deletar em cascata todos os seus Veículos (e consequentemente suas Manutenções).

## Banco de Dados

- **Plataforma:** Supabase (PostgreSQL gerenciado)
- Todas as operações de criação, edição e deleção devem persistir no Supabase
- As consultas do dashboard (contagens, histórico) devem buscar dados diretamente do Supabase
- O estado local via `AppContext` é temporário (mock) e será substituído por chamadas ao Supabase quando a integração for implementada

## Frontend

- Todas as páginas devem ser responsivas (mobile e desktop)
- Paleta de cores: laranja (`orange-500` / `#f97316`) e cinza (`gray-900`, `gray-100`)
- Componentes reutilizáveis ficam em `/components`
- O `NavBar` é renderizado no layout raiz (`app/layout.tsx`) e aparece em todas as páginas

## Comandos

**Frontend** (pasta raiz):
```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run start    # servidor de produção
```

**Backend** (pasta `backend/`):
```bash
./mvnw spring-boot:run   # sobe a API em localhost:8080
./mvnw test              # executa os testes
./mvnw package           # gera o JAR
```
