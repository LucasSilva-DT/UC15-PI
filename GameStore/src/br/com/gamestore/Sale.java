package br.com.gamestore;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
public record Sale(String id, String productId, String productName, int quantity, BigDecimal unitPrice, Instant date) {
    public Sale {
        Objects.requireNonNull(id); Objects.requireNonNull(productId); Objects.requireNonNull(productName);
        Objects.requireNonNull(unitPrice); Objects.requireNonNull(date);
        if (quantity <= 0 || unitPrice.signum() <= 0) throw new BusinessException("Venda inválida.");
    }
    public BigDecimal total() { return unitPrice.multiply(BigDecimal.valueOf(quantity)); }
}
