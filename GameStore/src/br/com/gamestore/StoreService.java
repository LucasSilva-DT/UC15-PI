package br.com.gamestore;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.Clock;
import java.util.*;
public final class StoreService {
    private final StoreRepository repository;
    private final Clock clock;
    private StoreState state;
    public StoreService(StoreRepository repository, Clock clock) throws IOException {
        this.repository = Objects.requireNonNull(repository); this.clock = Objects.requireNonNull(clock);
        state = repository.load();
    }
    public List<Product> products() { return state.products(); }
    public List<Sale> sales() { return state.sales(); }
    public Product find(String id) {
        return state.products().stream().filter(p -> p.id().equals(id)).findFirst().orElseThrow(() -> new BusinessException("Produto não encontrado."));
    }
    private void uniqueName(String name, String exceptId) {
        if (name == null) throw new BusinessException("Nome obrigatório.");
        if (state.products().stream().anyMatch(p -> !p.id().equals(exceptId) && p.name().equalsIgnoreCase(name.trim()))) throw new BusinessException("Já existe um produto com esse nome.");
    }
    public Product add(String name, BigDecimal price, int stock) throws IOException {
        uniqueName(name, "");
        Product p = new Product(UUID.randomUUID().toString(), name, price, stock);
        var products = new ArrayList<>(state.products()); products.add(p);
        commit(new StoreState(products, state.sales())); return p;
    }
    public void update(String id, String name, BigDecimal price, int stock) throws IOException {
        find(id); uniqueName(name, id);
        Product replacement = new Product(id, name, price, stock);
        var products = new ArrayList<>(state.products());
        products.replaceAll(p -> p.id().equals(id) ? replacement : p);
        commit(new StoreState(products, state.sales()));
    }
    public void remove(String id) throws IOException {
        find(id); var products = new ArrayList<>(state.products());
        products.removeIf(p -> p.id().equals(id)); commit(new StoreState(products, state.sales()));
    }
    public Sale sell(String id, int quantity) throws IOException {
        Product p = find(id);
        if (quantity <= 0) throw new BusinessException("Quantidade deve ser positiva.");
        if (quantity > p.stock()) throw new BusinessException("Estoque insuficiente.");
        Sale sale = new Sale(UUID.randomUUID().toString(), id, p.name(), quantity, p.price(), clock.instant());
        var products = new ArrayList<>(state.products());
        products.replaceAll(item -> item.id().equals(id) ? new Product(id, p.name(), p.price(), p.stock() - quantity) : item);
        var sales = new ArrayList<>(state.sales()); sales.add(sale);
        commit(new StoreState(products, sales)); return sale;
    }
    private void commit(StoreState next) throws IOException { repository.save(next); state = next; }
}
