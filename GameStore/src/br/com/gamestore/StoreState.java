package br.com.gamestore;
import java.util.List;
public record StoreState(List<Product> products, List<Sale> sales) {
    public StoreState { products = List.copyOf(products); sales = List.copyOf(sales); }
    public static StoreState empty() { return new StoreState(List.of(), List.of()); }
}
