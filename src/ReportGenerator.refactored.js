// src/ReportGenerator.refactored.js

class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const formatter = this.getFormatter(reportType);
    const visibleItems = this.filterItemsByRole(user, items);

    let report = '';
    report += formatter.generateHeader(user);

    let total = 0;

    for (const item of visibleItems) {
      total += item.value;
      report += formatter.generateRow(item);
    }

    report += formatter.generateFooter(total);

    return report.trim();
  }

  filterItemsByRole(user, items) {
    if (user.role === 'ADMIN') {
      return items.map(item => {
        if (item.value > ReportGenerator.ADMIN_PRIORITY_THRESHOLD) {
          item.priority = true;
        }

        return item;
      });
    }

    if (user.role === 'USER') {
      return items.filter(
        item => item.value <= ReportGenerator.MAX_USER_ITEM_VALUE
      );
    }

    return [];
  }

  getFormatter(reportType) {
    switch (reportType) {
      case 'CSV':
        return new CsvFormatter();

      case 'HTML':
        return new HtmlFormatter();

      default:
        throw new Error(
          `Tipo de relatório não suportado: ${reportType}`
        );
    }
  }
}

ReportGenerator.MAX_USER_ITEM_VALUE = 500;
ReportGenerator.ADMIN_PRIORITY_THRESHOLD = 1000;

class CsvFormatter {
  generateHeader() {
    return 'ID,NOME,VALOR\n';
  }

  generateRow(item) {
    return `${item.id},${item.name},${item.value}\n`;
  }

  generateFooter(total) {
    return `\nTotal\n${total}\n`;
  }
}

class HtmlFormatter {
  generateHeader(user) {
    return `<html><body>
<h1>Relatório</h1>
<h2>Usuário: ${user.name}</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n`;
  }

  generateRow(item) {
    const style = item.priority
      ? 'style="font-weight:bold;"'
      : '';

    return `<tr ${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  generateFooter(total) {
    return `</table>
<h3>Total: ${total}</h3>
</body></html>\n`;
  }
}

export { ReportGenerator };