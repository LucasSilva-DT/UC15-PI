package br.com.gamestore;
import java.math.BigDecimal;
import org.junit.Test;
import static org.junit.Assert.*;
public class ProductTest {
    private Product product(String name, String price, int stock) { return new Product("p1", name, new BigDecimal(price), stock); }
    @Test public void removeEspacosExternosDoNome() { assertEquals("Jogo A", product("  Jogo A  ", "1.00", 1).name()); }
    @Test public void aceitaEstoqueZero() { assertEquals(0, product("Jogo A", "0.01", 0).stock()); }
    @Test public void rejeitaNomeEmBranco() { assertThrows(BusinessException.class, () -> product(" ", "1.00", 0)); }
    @Test public void rejeitaEstoqueNegativo() { assertThrows(BusinessException.class, () -> product("Jogo A", "1.00", -1)); }
    @Test public void rejeitaPrecoZero() { assertThrows(BusinessException.class, () -> product("Jogo A", "0.00", 0)); }
    @Test public void rejeitaPrecoNegativo() { assertThrows(BusinessException.class, () -> product("Jogo A", "-0.01", 0)); }
    @Test public void rejeitaMaisDeDuasCasasDecimais() { assertThrows(BusinessException.class, () -> product("Jogo A", "0.001", 0)); }
    @Test public void aceitaPrecoInteiro() { assertEquals(new BigDecimal("10"), product("Jogo A", "10", 0).price()); }
}
