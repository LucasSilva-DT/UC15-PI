# GameStoreTestes - Etapa 7

Projeto Java SE / Ant reconhecido pelo NetBeans, com JUnit 4.13.2 e Hamcrest Core 1.3 incluídos em `lib`. Requer JDK 17 ou superior. Não requer downloads para executar os testes.

Mantenha `GameStoreTestes` e `GameStore` como pastas irmãs. O projeto compila os fontes reais da aplicação em `../GameStore/src`, sem duplicar suas regras.

## NetBeans

Arquivo > Abrir projeto > GameStoreTestes. Selecione JDK 17+ como plataforma. Use Testar Projeto (Alt+F6) ou Executar Projeto. Limpar e Construir também executa os testes. O projeto usa um build Ant próprio; os resultados por caso aparecem na saída. O arquivo XML é salvo em `reports/TEST-GameStoreJUnit.xml`.

## Terminal

Com Ant: `ant clean test`.
Windows sem Ant: `executar-testes.bat` (JDK no PATH).
Linux/macOS sem Ant: `sh executar-testes.sh` (JDK no PATH).

## Casos

- SaleTest: total de venda e validações de quantidade/preço.
- ProductTest: nome, estoque e preço.
- StoreServiceTest: estoque, venda, histórico, duplicidade, imutabilidade e falha de gravação simulada.

O runner chama o JUnit real; os cenários são métodos anotados com `@Test`, usando asserções JUnit. Não acessa banco nem arquivo de dados da aplicação. A criação de um XML de relatório em `reports` não altera cadastros reais.

Plano de testes e evidência do commit estão nas pastas `documentos` e `evidencias` da entrega. Os testes manuais web são planejados e não representam validação de uma interface web implementada.
