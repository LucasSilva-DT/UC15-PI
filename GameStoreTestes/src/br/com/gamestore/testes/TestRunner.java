package br.com.gamestore.testes;
import java.nio.file.*;
import java.util.*;
import org.junit.runner.*;
import org.junit.runner.notification.*;
public final class TestRunner {
    private TestRunner() { }
    public static void main(String[] args) throws Exception {
        String[] names = {"br.com.gamestore.SaleTest", "br.com.gamestore.ProductTest", "br.com.gamestore.StoreServiceTest"};
        Class<?>[] classes = new Class<?>[names.length];
        for (int i = 0; i < names.length; i++) classes[i] = Class.forName(names[i]);
        var core = new JUnitCore();
        var failures = new ArrayList<Failure>();
        var cases = new ArrayList<String>();
        core.addListener(new RunListener() {
            @Override public void testFailure(Failure failure) { failures.add(failure); }
            @Override public void testFinished(Description description) {
                Failure failure = failures.stream().filter(f -> f.getDescription().equals(description)).findFirst().orElse(null);
                System.out.println((failure == null ? "APROVADO " : "FALHOU ") + description.getClassName() + "." + description.getMethodName());
                cases.add("  <testcase classname=\"" + xml(description.getClassName()) + "\" name=\"" + xml(description.getMethodName()) + "\">" + (failure == null ? "" : "<failure message=\"" + xml(failure.getMessage()) + "\">" + xml(failure.getTrace()) + "</failure>") + "</testcase>");
            }
        });
        Result result = core.run(classes);
        String report = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<testsuite name=\"GameStoreJUnit\" tests=\"" + result.getRunCount() + "\" failures=\"" + result.getFailureCount() + "\" errors=\"0\" skipped=\"" + result.getIgnoreCount() + "\" time=\"" + result.getRunTime() / 1000.0 + "\">\n" + String.join("\n", cases) + "\n</testsuite>\n";
        Path output = Path.of("reports", "TEST-GameStoreJUnit.xml");
        Files.createDirectories(output.getParent()); Files.writeString(output, report);
        System.out.printf("JUnit %s | Testes: %d | Falhas: %d | Ignorados: %d%n", junit.runner.Version.id(), result.getRunCount(), result.getFailureCount(), result.getIgnoreCount());
        for (Failure failure : result.getFailures()) System.err.println(failure.getTrace());
        if (!result.wasSuccessful() || result.getRunCount() == 0) System.exit(1);
    }
    private static String xml(String value) {
        return String.valueOf(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&apos;");
    }
}
