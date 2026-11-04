package br.com.gamestore;
import java.math.BigDecimal;
import java.util.Objects;
public record Product(String id, String name, BigDecimal price, int stock) {
    public Product {
        Objects.requireNonNull(id); Objects.requireNonNull(name); Objects.requireNonNull(price);
        name = name.trim();
        if (id.isBlank() || name.isBlank()) throw new BusinessException("Nome e identificador obrigatórios.");
        if (price.signum() <= 0 || price.scale() > 2) throw new BusinessException("Preço positivo com até duas casas decimais.");
        if (stock < 0) throw new BusinessException("Estoque não pode ser negativo.");
    }
}
