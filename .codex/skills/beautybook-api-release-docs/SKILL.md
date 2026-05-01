---
name: beautybook-api-release-docs
description: Manter a documentacao de suporte e de entrega da BeautyBook API. Use quando o Codex precisar atualizar README.md, docs/openapi.yaml, docs/regraDeNegocio.md, paginas da wiki, guias de execucao, ou outra documentacao do repositorio apos mudancas de produto, testes, CI ou comportamento da API.
---

# BeautyBook API Release Docs

## Visao Geral

Use esta skill para manter a documentacao do projeto coerente apos mudancas de codigo, testes, CI ou contrato. Escreva no estilo atual do repositorio, que e majoritariamente em portugues e orientado a execucao pratica.

## Mapa Da Documentacao

- Guia principal: `README.md`
- Contrato da API: `docs/openapi.yaml`
- Regras de negocio: `docs/regraDeNegocio.md`
- Contexto do produto: `docs/epico-e-user-stories.md`
- Material de testes e execucao: `.wiki/` e `docs/wiki/`

## Fluxo De Trabalho

1. Trate o codigo em execucao e os testes como fonte da verdade quando surgirem conflitos na documentacao.
2. Atualize o menor conjunto de docs do qual um usuario ou mantenedor realmente dependeria apos a mudanca.
3. Se formato de endpoint, auth ou exemplos mudarem, atualize `docs/openapi.yaml` junto com a secao correspondente do README.
4. Se a mudanca afetar execucao, testes ou CI, sincronize os guias relevantes em `.wiki/` ou `docs/wiki/`.
5. Mantenha exemplos concretos e executaveis; evite documentacao aspiracional que nao esteja implementada.

## Orientacoes Especificas Do Projeto

- Preserve o nome atual do projeto como `BeautyBook API` e o slug do repositorio como `beautyBook-api` quando isso for relevante.
- Mantenha as URLs locais alinhadas com os padroes da app na porta `3000`.
- Reflita os scripts reais de `package.json` para inicializacao e testes.
- Mantenha nomes de papeis, nomes de rotas e redacao das regras de negocio consistentes com a implementacao.
- Se notar conteudo duplicado entre `.wiki/` e `docs/wiki/`, atualize a copia da qual a tarefa depende e mencione a duplicacao no resumo final.

## Criterios De Conclusao

- A documentacao corresponde ao comportamento implementado.
- Caminhos criticos para o usuario, como setup, auth, endpoints e execucao de testes, continuam corretos.
- A nota final lista quais docs mudaram e sinaliza qualquer fonte de verdade duplicada que continue existindo.
