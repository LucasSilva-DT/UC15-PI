package br.com.gamestore;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;
public class StoreServiceTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-04T12:00:00Z"), ZoneOffset.UTC);
    private StoreService service;
    private Product product;
    @Before public void preparar() throws IOException {
        service = new StoreService(new MemoryRepository(), CLOCK);
        product = service.add("Jogo A", new BigDecimal("99.90"), 5);
    }
    @Test public void vendaBaixaEstoqueERegistraTotal() throws IOException {
        Sale sale = service.sell(product.id(), 2);
        assertEquals(3, service.find(product.id()).stock());
        assertEquals(new BigDecimal("199.80"), sale.total());
        assertEquals(List.of(sale), service.sales());
        assertEquals(CLOCK.instant(), sale.date());
    }
    @Test public void permiteVenderTodoOEstoque() throws IOException {
        service.sell(product.id(), 5); assertEquals(0, service.find(product.id()).stock());
        assertThrows(BusinessException.class, () -> service.sell(product.id(), 1));
    }
    @Test public void rejeitaVendaMaiorQueEstoqueSemAlterarEstado() {
        assertThrows(BusinessException.class, () -> service.sell(product.id(), 6));
        assertEquals(5, service.find(product.id()).stock()); assertTrue(service.sales().isEmpty());
    }
    @Test public void rejeitaQuantidadeZeroOuNegativaSemAlterarEstado() {
        assertThrows(BusinessException.class, () -> service.sell(product.id(), 0));
        assertThrows(BusinessException.class, () -> service.sell(product.id(), -1));
        assertEquals(5, service.find(product.id()).stock()); assertTrue(service.sales().isEmpty());
    }
    @Test public void rejeitaVendaDeProdutoInexistente() {
        assertThrows(BusinessException.class, () -> service.sell("ausente", 1)); assertTrue(service.sales().isEmpty());
    }
    @Test public void rejeitaCadastroDuplicadoIgnorandoCaixaEEspacos() {
        assertThrows(BusinessException.class, () -> service.add("  jogo a  ", BigDecimal.ONE, 1));
        assertEquals(1, service.products().size());
    }
    @Test public void alteraProdutoPreservandoId() throws IOException {
        service.update(product.id(), "Jogo B", new BigDecimal("10.00"), 2);
        Product updated = service.find(product.id());
        assertEquals(product.id(), updated.id()); assertEquals("Jogo B", updated.name()); assertEquals(2, updated.stock());
    }
    @Test public void rejeitaAlteracaoParaNomeDuplicadoSemModificarProduto() throws IOException {
        service.add("Jogo B", BigDecimal.ONE, 1);
        assertThrows(BusinessException.class, () -> service.update(product.id(), "jogo b", BigDecimal.ONE, 2));
        assertEquals(product, service.find(product.id()));
    }
    @Test public void rejeitaAlteracaoInvalidaSemModificarProduto() {
        assertThrows(BusinessException.class, () -> service.update(product.id(), "Jogo B", BigDecimal.ZERO, 2));
        assertEquals(product, service.find(product.id()));
    }
    @Test public void historicoPreservaNomeEPrecoAposAlterarEExcluir() throws IOException {
        Sale original = service.sell(product.id(), 1);
        service.update(product.id(), "Novo nome", new BigDecimal("1.00"), 9);
        service.remove(product.id());
        assertTrue(service.products().isEmpty()); assertEquals(List.of(original), service.sales());
        assertEquals("Jogo A", original.productName()); assertEquals(new BigDecimal("99.90"), original.unitPrice());
    }
    @Test public void listasNaoPermitemAlteracaoExterna() {
        assertThrows(UnsupportedOperationException.class, () -> service.products().clear());
        assertThrows(UnsupportedOperationException.class, () -> service.sales().clear());
    }
    @Test public void erroDePersistenciaNaoConfirmaVenda() throws IOException {
        StoreRepository failing = new StoreRepository() {
            public StoreState load() { return new StoreState(List.of(product), List.of()); }
            public void save(StoreState state) throws IOException { throw new IOException("Falha simulada"); }
        };
        var failingService = new StoreService(failing, CLOCK);
        assertThrows(IOException.class, () -> failingService.sell(product.id(), 1));
        assertEquals(5, failingService.find(product.id()).stock()); assertTrue(failingService.sales().isEmpty());
    }
    @Test public void repositorioEmMemoriaPermiteReabrirServico() throws IOException {
        var repository = new MemoryRepository();
        var first = new StoreService(repository, CLOCK);
        Product saved = first.add("Jogo salvo", BigDecimal.ONE, 2);
        first.sell(saved.id(), 1);
        var reopened = new StoreService(repository, CLOCK);
        assertEquals(1, reopened.find(saved.id()).stock()); assertEquals(1, reopened.sales().size());
    }
}
