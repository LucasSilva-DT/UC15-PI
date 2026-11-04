package br.com.gamestore;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.Test;
import static org.junit.Assert.*;
public class SaleTest {
    private Sale sale(int quantity, String price) {
        return new Sale("v1", "p1", "Jogo", quantity, new BigDecimal(price), Instant.parse("2026-11-04T12:00:00Z"));
    }
    @Test public void calculaTotalDeDuasUnidades() {
        assertEquals(new BigDecimal("199.80"), sale(2, "99.90").total());
    }
    @Test public void calculaCentavosSemErroDePontoFlutuante() {
        assertEquals(new BigDecimal("0.30"), sale(3, "0.10").total());
    }
    @Test public void totalDeUmaUnidadeMantemPreco() {
        assertEquals(new BigDecimal("59.99"), sale(1, "59.99").total());
    }
    @Test public void calculaQuantidadeGrandeSemOverflowInteiro() {
        assertEquals(new BigDecimal("214748364678525163.53"), sale(Integer.MAX_VALUE, "99999999.99").total());
    }
    @Test public void rejeitaQuantidadeZero() {
        assertThrows(BusinessException.class, () -> sale(0, "10.00"));
    }
    @Test public void rejeitaQuantidadeNegativa() {
        assertThrows(BusinessException.class, () -> sale(-1, "10.00"));
    }
    @Test public void rejeitaPrecoZeroOuNegativo() {
        assertThrows(BusinessException.class, () -> sale(1, "0.00"));
        assertThrows(BusinessException.class, () -> sale(1, "-1.00"));
    }
}
