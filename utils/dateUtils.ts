/**
 * Utilitaires pour la gestion des dates et timestamps Firestore
 */

export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

/**
 * Convertit un timestamp Firestore en objet Date JavaScript
 */
export function firestoreTimestampToDate(timestamp: FirestoreTimestamp | string | Date | null | undefined): Date | null {
  if (!timestamp) return null;
  
  if (typeof timestamp === 'object' && timestamp._seconds) {
    // Timestamp Firestore
    return new Date(timestamp._seconds * 1000);
  } else if (typeof timestamp === 'string') {
    // String ISO
    return new Date(timestamp);
  } else if (timestamp instanceof Date) {
    // Déjà un objet Date
    return timestamp;
  } else {
    // Autre format, essayer de convertir
    const date = new Date(timestamp as any);
    return isNaN(date.getTime()) ? null : date;
  }
}

/**
 * Formate une date pour l'affichage "Membre depuis"
 */
export function formatMemberSince(timestamp: FirestoreTimestamp | string | Date | null | undefined): string {
  const date = firestoreTimestampToDate(timestamp);
  if (!date) return 'Jan 2023'; // Fallback
  
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'short' 
  });
}

/**
 * Formate une date pour l'affichage complet
 */
export function formatFullDate(timestamp: FirestoreTimestamp | string | Date | null | undefined): string {
  const date = firestoreTimestampToDate(timestamp);
  if (!date) return 'Date inconnue';
  
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Formate une heure pour l'affichage
 */
export function formatTime(timeString: string): string {
  const date = new Date(`2000-01-01T${timeString}`);
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
} 