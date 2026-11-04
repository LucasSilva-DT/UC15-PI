package br.com.gamestore;
import java.nio.file.Path;
import java.time.Clock;
import java.util.Scanner;
public final class Main {
    private Main() { }
    public static void main(String[] args) throws Exception {
        if (args.length == 1 && args[0].equals("--test")) { SelfTest.run(); return; }
        try {
            var service = new StoreService(new FileRepository(Path.of("dados", "gamestore.dat")), Clock.systemUTC());
            new ConsoleUI(service, new Scanner(System.in, java.nio.charset.StandardCharsets.UTF_8)).run();
        } catch (java.io.IOException e) {
            System.err.println("Falha ao abrir os dados. Preserve o arquivo para recuperação: " + e.getMessage());
            System.exit(1);
        }
    }
}
