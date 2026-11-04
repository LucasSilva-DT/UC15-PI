package br.com.gamestore;
import java.io.IOException;
public interface StoreRepository {
    StoreState load() throws IOException;
    void save(StoreState state) throws IOException;
}
