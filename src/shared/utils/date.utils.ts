/**
 * Formata uma data ISO string para formato brasileiro
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'Data inválida';
  }
};

/**
 * Formata uma data ISO string para formato brasileiro com hora
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Data inválida';
  }
};

/**
 * Formata data para formato relativo (ex: "há 2 dias")
 */
export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Há 1 dia';
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`;
    if (diffInDays < 365) return `Há ${Math.floor(diffInDays / 30)} meses`;
    
    return `Há ${Math.floor(diffInDays / 365)} anos`;
  } catch {
    return 'Data inválida';
  }
};