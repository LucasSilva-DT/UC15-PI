package br.com.gamestore;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Scanner;
public final class ConsoleUI {
    private final StoreService service;
    private final Scanner input;
    public ConsoleUI(StoreService service, Scanner input) { this.service = service; this.input = input; }
    private String read(String label) {
        System.out.print(label + ": ");
        if (!input.hasNextLine()) throw new java.util.NoSuchElementException();
        return input.nextLine().trim();
    }
    private BigDecimal price() { return new BigDecimal(read("Preço (ex.: 59,90)").replace(',', '.')); }
    private int stock() { return Integer.parseInt(read("Estoque")); }
    public void run() {
        while (true) {
            System.out.println("\nGAMESTORE | 1 Listar | 2 Cadastrar | 3 Alterar | 4 Excluir | 5 Vender | 6 Vendas | 0 Sair");
            try {
                switch (read("Opção")) {
                    case "0": return;
                    case "1":
                        if (service.products().isEmpty()) System.out.println("Nenhum produto cadastrado.");
                        service.products().forEach(p -> System.out.printf("%s | %s | R$ %s | Estoque: %d%n", p.id(), p.name(), p.price().toPlainString(), p.stock())); break;
                    case "2": service.add(read("Nome"), price(), stock()); System.out.println("Produto cadastrado."); break;
                    case "3": service.update(read("ID completo"), read("Nome"), price(), stock()); System.out.println("Produto alterado."); break;
                    case "4": service.remove(read("ID completo")); System.out.println("Produto excluído."); break;
                    case "5":
                        Sale sale = service.sell(read("ID completo"), Integer.parseInt(read("Quantidade")));
                        System.out.println("Venda registrada. Total: R$ " + sale.total().toPlainString()); break;
                    case "6":
                        if (service.sales().isEmpty()) System.out.println("Nenhuma venda registrada.");
                        service.sales().forEach(s -> System.out.printf("%s | %s | %s | %d un. | R$ %s%n", s.id(), s.date(), s.productName(), s.quantity(), s.total().toPlainString())); break;
                    default: System.out.println("Opção inválida.");
                }
            } catch (NumberFormatException e) { System.out.println("Informe um número válido."); }
            catch (BusinessException e) { System.out.println(e.getMessage()); }
            catch (IOException e) { System.out.println("Não foi possível salvar. Operação cancelada: " + e.getMessage()); }
            catch (java.util.NoSuchElementException e) { return; }
        }
    }
}
