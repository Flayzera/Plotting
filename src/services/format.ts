export const formatService = {
  currency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  },

  date(value: string | Date | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR');
  },

  datetime(value: string | Date | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('pt-BR');
  },

  id(value: number): string {
    return value.toString().padStart(4, '0')
  }
}
