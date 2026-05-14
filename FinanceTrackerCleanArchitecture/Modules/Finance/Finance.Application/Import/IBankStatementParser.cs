namespace Finance.Application.Import;

public interface IBankStatementParser
{
  IEnumerable<ParsedTransaction> Parse(byte[] pdfBytes);
}
