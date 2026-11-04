package br.com.gamestore;
public final class MemoryRepository implements StoreRepository {
    private StoreState state = StoreState.empty();
    @Override public StoreState load() { return state; }
    @Override public void save(StoreState state) { this.state = state; }
}
