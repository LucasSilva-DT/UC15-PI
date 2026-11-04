GAMESTORE — ETAPA 6
Autor: Lucas Oliveira

REQUISITOS
JDK 17 ou superior para compilar; Java 17 ou superior para executar.
NetBeans com suporte a Java SE e Ant. Sem bibliotecas externas e sem banco a instalar.

EXECUÇÃO IMEDIATA
Windows: abra GameStore/executar.bat.
Terminal: entre na pasta GameStore e execute:
java -Dfile.encoding=UTF-8 -jar dist/GameStore.jar
Linux/macOS: sh executar.sh

TESTES
Windows: testar.bat
Terminal: java -jar dist/GameStore.jar --test
Resultado esperado: 26 testes aprovados. Os testes usam dados temporários e não alteram o cadastro real.

NETBEANS
Arquivo > Abrir projeto > selecione a pasta GameStore.
Selecione JDK 17 ou superior como plataforma Java.
Limpar e Construir recompila o projeto e gera dist/GameStore.jar.
Executar inicia Main. A classe principal é br.com.gamestore.Main.
Com Ant instalado: ant clean jar; ant test; ant run.
Para entrada interativa, prefira executar.bat ou o terminal.

USO
2 cadastra nome, preço e estoque. Preço aceita 59,90 ou 59.90.
1 lista produtos e o identificador completo usado em alterar/excluir/vender.
3 altera um produto; 4 exclui; 5 registra venda; 6 mostra histórico; 0 sai.
Uma venda reduz o estoque e mantém o nome e o preço vigentes naquele momento.
Os dados ficam em dados/gamestore.dat, relativos à pasta de execução.
Mantenha uma cópia desse arquivo para backup. Não edite manualmente.

ESCOPO DA ENTREGA
Novo projeto permitido pela observação do enunciado, pois o código da fase anterior não foi disponibilizado.
Esta etapa prepara o domínio para uma futura interface web; não há servidor web nem telas Swing.
Persistência local para uma única instância. Não abrir duas instâncias sobre o mesmo arquivo.
Não contempla autenticação, emissão fiscal, estorno de venda ou múltiplos usuários.

CONTEÚDO
GameStore/: projeto NetBeans, fontes Java e executável JAR.
documentos/Projeto_de_Software.pdf: requisitos, regras e critérios de aceitação.
documentos/Relatorio_Tecnico.pdf: SOLID, separação de responsabilidades, padrões e validação.
evidencias/: saídas reais dos testes, compilação e registro Git local.
GameStore_Etapa6.bundle: cópia transportável do repositório Git local.

GITHUB — PUBLICADO
Repositório: https://github.com/LucasSilva-DT/UC15-PI
Commit do código: e15d43cbce9dbc420cf1cb2fdc94f6468ae667a9
As capturas reais e a identificação do commit estão no relatório e em evidencias/.
Use este ZIP atualizado para entregar a atividade.
