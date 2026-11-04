package br.com.gamestore;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.*;
public final class SelfTest {
    private static int passed;
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-04T12:00:00Z"), ZoneOffset.UTC);
    private SelfTest() { }
    private interface Action { void run() throws Exception; }
    private static void check(String name, boolean condition) {
        if (!condition) throw new AssertionError(name);
        passed++; System.out.println("OK " + passed + " - " + name);
    }
    private static void rejects(String name, Class<? extends Throwable> type, Action action) throws Exception {
        try { action.run(); } catch (Exception e) { if (type.isInstance(e)) { check(name, true); return; } throw e; }
        throw new AssertionError("Não rejeitou: " + name);
    }
    public static void run() throws Exception {
        passed = 0;
        var service = new StoreService(new MemoryRepository(), CLOCK);
        check("Estado inicial vazio", service.products().isEmpty() && service.sales().isEmpty());
        var p = service.add("  Jogo A  ", new BigDecimal("99.90"), 5);
        check("Cadastro e normalização", p.name().equals("Jogo A") && service.find(p.id()).stock() == 5);
        rejects("Nome duplicado", BusinessException.class, () -> service.add("jogo a", BigDecimal.ONE, 1));
        rejects("Nome vazio", BusinessException.class, () -> service.add(" ", BigDecimal.ONE, 1));
        rejects("Preço zero", BusinessException.class, () -> service.add("B", BigDecimal.ZERO, 1));
        rejects("Preço negativo", BusinessException.class, () -> service.add("B", new BigDecimal("-1"), 1));
        rejects("Mais de duas casas", BusinessException.class, () -> service.add("B", new BigDecimal("1.001"), 1));
        rejects("Estoque negativo", BusinessException.class, () -> service.add("B", BigDecimal.ONE, -1));
        rejects("Produto inexistente", BusinessException.class, () -> service.find("ausente"));
        rejects("Venda com quantidade zero", BusinessException.class, () -> service.sell(p.id(), 0));
        rejects("Venda com quantidade negativa", BusinessException.class, () -> service.sell(p.id(), -1));
        rejects("Estoque insuficiente", BusinessException.class, () -> service.sell(p.id(), 6));
        check("Rejeições não alteram estado", service.find(p.id()).stock() == 5 && service.sales().isEmpty());
        var sale = service.sell(p.id(), 2);
        check("Total decimal exato", sale.total().equals(new BigDecimal("199.80")));
        check("Baixa no estoque", service.find(p.id()).stock() == 3);
        check("Data controlável e histórico", sale.date().equals(CLOCK.instant()) && service.sales().size() == 1);
        service.update(p.id(), "Jogo atualizado", new BigDecimal("120.00"), 4);
        check("Alteração do produto", service.find(p.id()).name().equals("Jogo atualizado"));
        check("Histórico mantém preço e nome originais", sale.productName().equals("Jogo A") && sale.unitPrice().equals(new BigDecimal("99.90")));
        rejects("Lista imutável", UnsupportedOperationException.class, () -> service.products().clear());
        service.remove(p.id());
        check("Exclusão preserva histórico", service.products().isEmpty() && service.sales().size() == 1);
        rejects("Excluir inexistente", BusinessException.class, () -> service.remove("ausente"));
        Path dir = Files.createTempDirectory("gamestore-test-");
        try {
            Path data = dir.resolve("store.dat");
            var disk = new StoreService(new FileRepository(data), CLOCK);
            var item = disk.add("Ação e aventura", new BigDecimal("10.50"), 3);
            disk.sell(item.id(), 1);
            var reopened = new StoreService(new FileRepository(data), CLOCK);
            check("Persistência de produtos", reopened.find(item.id()).stock() == 2);
            check("Persistência de vendas e UTF-8", reopened.sales().get(0).productName().equals("Ação e aventura") && reopened.sales().get(0).total().equals(new BigDecimal("10.50")));
            Files.writeString(data, "arquivo corrompido");
            rejects("Arquivo corrompido é rejeitado", IOException.class, () -> new StoreService(new FileRepository(data), CLOCK));
            StoreRepository failing = new StoreRepository() {
                public StoreState load() { return new StoreState(java.util.List.of(item), java.util.List.of()); }
                public void save(StoreState state) throws IOException { throw new IOException("Falha simulada"); }
            };
            var fail = new StoreService(failing, CLOCK);
            rejects("Falha de gravação é propagada", IOException.class, () -> fail.sell(item.id(), 1));
            check("Falha não baixa estoque nem registra venda", fail.find(item.id()).stock() == 3 && fail.sales().isEmpty());
        } finally {
            try (var paths = Files.walk(dir)) { for (Path path : paths.sorted(java.util.Comparator.reverseOrder()).toList()) Files.deleteIfExists(path); }
        }
        System.out.println("RESULTADO: " + passed + " testes aprovados.");
    }
}
