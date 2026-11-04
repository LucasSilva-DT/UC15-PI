# GameStore — Projeto Integrador / Etapa 6

Projeto Java SE 17 de gestão de produtos, estoque e vendas, com princípios SOLID e regras independentes da interface de console.

**Autor:** Lucas Oliveira

## Estrutura

- `GameStore/`: projeto NetBeans / Ant e código-fonte.
- `documentos/`: projeto de software e relatório técnico.
- `evidencias/`: resultados reais dos testes e evidências da publicação.

## Compilar e testar

Com JDK 17+ e Apache Ant, dentro de `GameStore`:

```sh
ant clean jar
ant test
```

Os testes também são executados pelo método `main`:

```sh
java -jar dist/GameStore.jar --test
```

Resultado esperado: **26 testes aprovados**.

## Executar

Abra a pasta `GameStore` no NetBeans e use Limpar e Construir. Depois execute `executar.bat` ou:

```sh
java -Dfile.encoding=UTF-8 -jar dist/GameStore.jar
```

O ZIP de entrega contém o JAR já compilado. Os dados da aplicação são gravados em `dados/gamestore.dat`, relativos à pasta de execução.

## Funcionalidades

Cadastro, listagem, alteração e exclusão de produtos; controle de estoque; registro de vendas; cálculo decimal exato; histórico que preserva os dados da venda; persistência local em arquivo.

## Arquitetura

`ConsoleUI` apresenta a interface; `StoreService` implementa os casos de uso; `StoreRepository` abstrai persistência; `FileRepository` e `MemoryRepository` implementam esse contrato; `Product`, `Sale` e `StoreState` representam o domínio imutável.

Foi adotada a alternativa de projeto novo prevista no enunciado. Esta etapa prepara o domínio para futura interface web. Operação local, uma instância por arquivo.

## Etapa 7 - Testes JUnit

O projeto `GameStoreTestes/` executa 28 testes JUnit 4.13.2 sobre os fontes reais da GameStore. Bibliotecas incluídas; requer JDK 17+. No NetBeans, abra `GameStoreTestes` e use Testar Projeto ou Executar. No terminal, execute `ant clean test` dentro dessa pasta.

Plano de testes e evidências de versionamento: `Etapa7/documentos/`. Saída real dos testes e relatório XML: `Etapa7/evidencias/`.
