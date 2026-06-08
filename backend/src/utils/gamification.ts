const oneDayInMs = 24 * 60 * 60 * 1000;

export const calculateLevel = (xp: number): number => {
  if (xp >= 16000) return 8;
  if (xp >= 11000) return 7;
  if (xp >= 7000) return 6;
  if (xp >= 4000) return 5;
  if (xp >= 2000) return 4;
  if (xp >= 1000) return 3;
  if (xp >= 500) return 2;

  return 1;
};

export const getTodayDateBR = (): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
};

const dateStringToUTC = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);

  return Date.UTC(year, month - 1, day);
};

export const calculateStreak = (
  currentStreak: number,
  lastStudyDate?: string,
): {
  streak: number;
  shouldUpdateToday: boolean;
} => {
  if (!lastStudyDate) {
    return {
      streak: 1,
      shouldUpdateToday: true,
    };
  }

  const today = getTodayDateBR();
  const dayDifference = Math.floor(
    (dateStringToUTC(today) - dateStringToUTC(lastStudyDate)) / oneDayInMs,
  );

  // Ja estudou hoje: nao aumenta o streak novamente.
  if (dayDifference <= 0) {
    return {
      streak: currentStreak,
      shouldUpdateToday: false,
    };
  }

  // Estudou ontem: continua a sequencia.
  if (dayDifference === 1) {
    return {
      streak: currentStreak + 1,
      shouldUpdateToday: true,
    };
  }

  // Ficou pelo menos um dia sem estudar: reinicia a sequencia.
  return {
    streak: 1,
    shouldUpdateToday: true,
  };
};
