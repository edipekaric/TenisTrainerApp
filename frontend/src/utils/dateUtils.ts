export class DateUtils {
  private static readonly BOSNIA_TIMEZONE = 'Europe/Sarajevo';

  static formatToLocalDateString(date: Date): string {
    const bosnianDate = new Date(date.toLocaleString('en-US', { timeZone: this.BOSNIA_TIMEZONE }));
    const year = bosnianDate.getFullYear();
    const month = String(bosnianDate.getMonth() + 1).padStart(2, '0');
    const day = String(bosnianDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static parseLocalDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(12, 0, 0, 0);
    return date;
  }

  static getTodayString(): string {
    const now = new Date();
    return this.formatToLocalDateString(now);
  }

  static getBosnianTime(): Date {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: this.BOSNIA_TIMEZONE }));
  }

  static generateNextDays(count: number): Array<{
    date: Date;
    dateString: string;
    dayName: string;
    dayNumber: number;
    monthName: string;
    isToday: boolean;
  }> {
    // Custom Bosnian abbreviations
    const bosnianDayNames = ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'];
    const bosnianMonthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'];
    
    const days = [];
    const today = this.getBosnianTime();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Use custom Bosnian abbreviations
      const dayName = bosnianDayNames[date.getDay()];
      const monthName = bosnianMonthNames[date.getMonth()];
      
      days.push({
        date: date,
        dateString: this.formatToLocalDateString(date),
        dayName: dayName,
        dayNumber: date.getDate(),
        monthName: monthName,
        isToday: i === 0
      });
    }
    return days;
  }

  static isToday(dateString: string): boolean {
    return dateString === this.getTodayString();
  }

  static isPast(dateString: string): boolean {
    const today = this.getTodayString();
    return dateString < today;
  }

  static isFuture(dateString: string): boolean {
    const today = this.getTodayString();
    return dateString > today;
  }

  static daysDifference(dateString1: string, dateString2: string): number {
    const date1 = this.parseLocalDateString(dateString1);
    const date2 = this.parseLocalDateString(dateString2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static formatForDisplay(dateString: string): string {
    const date = this.parseLocalDateString(dateString);
    return date.toLocaleDateString('bs-BA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: this.BOSNIA_TIMEZONE
    });
  }

  static formatTimeForDisplay(time: string): string {
    if (time.match(/^\d{2}:\d{2}$/)) {
      return time;
    }
    
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString('bs-BA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: this.BOSNIA_TIMEZONE
    });
  }

  static getCurrentTimeString(): string {
    const now = this.getBosnianTime();
    return now.toLocaleTimeString('bs-BA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}