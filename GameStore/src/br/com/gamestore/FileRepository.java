package br.com.gamestore;
import java.io.*;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.Instant;
import java.util.ArrayList;
public final class FileRepository implements StoreRepository {
    private static final int MAGIC = 0x47535431;
    private final Path file;
    public FileRepository(Path file) { this.file = file.toAbsolutePath(); }
    @Override public StoreState load() throws IOException {
        if (!Files.exists(file)) return StoreState.empty();
        try (var in = new DataInputStream(new BufferedInputStream(Files.newInputStream(file)))) {
            if (in.readInt() != MAGIC) throw new IOException("Formato de arquivo inválido.");
            var products = new ArrayList<Product>();
            for (int i = 0, n = count(in); i < n; i++) products.add(new Product(in.readUTF(), in.readUTF(), new BigDecimal(in.readUTF()), in.readInt()));
            var sales = new ArrayList<Sale>();
            for (int i = 0, n = count(in); i < n; i++) sales.add(new Sale(in.readUTF(), in.readUTF(), in.readUTF(), in.readInt(), new BigDecimal(in.readUTF()), Instant.parse(in.readUTF())));
            if (in.read() != -1) throw new IOException("Dados adicionais inesperados.");
            return new StoreState(products, sales);
        } catch (IllegalArgumentException | BusinessException e) { throw new IOException("Arquivo de dados inválido.", e); }
    }
    private int count(DataInputStream in) throws IOException {
        int n = in.readInt();
        if (n < 0 || n > 1000000) throw new IOException("Quantidade de registros inválida.");
        return n;
    }
    @Override public void save(StoreState state) throws IOException {
        Files.createDirectories(file.getParent());
        Path temp = Files.createTempFile(file.getParent(), "gamestore-", ".tmp");
        try {
            try (var out = new DataOutputStream(new BufferedOutputStream(Files.newOutputStream(temp)))) {
                out.writeInt(MAGIC); out.writeInt(state.products().size());
                for (Product p : state.products()) { out.writeUTF(p.id()); out.writeUTF(p.name()); out.writeUTF(p.price().toPlainString()); out.writeInt(p.stock()); }
                out.writeInt(state.sales().size());
                for (Sale s : state.sales()) { out.writeUTF(s.id()); out.writeUTF(s.productId()); out.writeUTF(s.productName()); out.writeInt(s.quantity()); out.writeUTF(s.unitPrice().toPlainString()); out.writeUTF(s.date().toString()); }
            }
            try { Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE); }
            catch (AtomicMoveNotSupportedException e) { Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING); }
        } finally { Files.deleteIfExists(temp); }
    }
}
