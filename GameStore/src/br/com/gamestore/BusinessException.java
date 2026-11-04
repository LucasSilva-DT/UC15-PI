package br.com.gamestore;
public final class BusinessException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    public BusinessException(String message) { super(message); }
}
